#!/usr/bin/env python3
"""Automatic, project-scoped extraction of Codex Desktop prompt/final events."""
import argparse
import datetime as dt
import fcntl
import json
from pathlib import Path
import re
import time

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / '.capture/config.json'


def extract(records):
    models = {}
    for row in records:
        if row.get('type') == 'turn_context':
            p = row['payload']
            models[p.get('turn_id')] = p.get('model')
    entries = []
    number = 0
    for row in records:
        p = row.get('payload', {})
        if row.get('type') != 'event_msg' or p.get('type') != 'item_completed':
            continue
        item = p.get('item', {})
        kind = item.get('type')
        text = None
        entry_type = None
        if kind == 'UserMessage':
            text = '\n'.join(c['text'] for c in item.get('content', []) if c.get('type') == 'text')
            entry_type = 'PROMPT'
        elif kind == 'FunctionCallOutput' and item.get('namespace') == 'codex_app' and item.get('name') in ('create_thread', 'send_message_to_thread'):
            # Desktop delivers genuine incoming task prompts in a delegation envelope.
            output = item.get('output', '')
            match = re.fullmatch(r'<codex_delegation>\s*<source_thread_id>[^<]+</source_thread_id>\s*<input>([\s\S]*)</input>\s*</codex_delegation>', output)
            if match:
                text = match.group(1)
                entry_type = 'PROMPT'
        elif kind == 'AgentMessage' and item.get('phase') == 'final_answer':
            text = ''.join(c['text'] for c in item.get('content', []) if c.get('type') == 'Text')
            entry_type = 'RESPONSE'
        if text is None:
            continue
        model = models.get(p.get('turn_id'))
        if not model:
            raise ValueError('Actual model metadata not yet available')
        if entry_type == 'PROMPT':
            number += 1
        if number:
            entries.append({'type': entry_type, 'num': number, 'timestamp': row['timestamp'], 'model': model, 'text': text})
    return entries


def write_session(meta, entries, author):
    if not entries:
        return
    sid = meta.get('session_id', meta['id'])
    first = entries[0]['timestamp']
    prompts = [e for e in entries if e['type'] == 'PROMPT']
    prefix = first[:19].replace('T', '_').replace(':', '-')
    path = ROOT / '.agent-logs' / f'{prefix}_{sid}.md'
    header = ('---\n' + f'session_id: {sid}\ndate: {first[:10]}\nauthor: {author}\nmodel: {entries[0]["model"]}\ntool: codex-desktop\nproject: amazon-rebuild\ntotal_exchanges: {len(prompts)}\nfirst_prompt_time: {first}\nlast_prompt_time: {prompts[-1]["timestamp"]}\n---\n\n' + f'# Session Log - {first[:10]}\n\nSession: `{sid[:8]}` | Project: `amazon-rebuild` | Author: `{author}`\n\n---\n\n')
    body = ''.join(f'[LOG_ENTRY type={e["type"]} num={e["num"]} session={sid[:8]}]\ntimestamp: {e["timestamp"]}\nmodel: {e["model"]}\n\n{e["text"]}\n\n\n' for e in entries)
    content = header + body
    if path.exists():
        previous = path.read_text()
        old_body = previous[previous.index('[LOG_ENTRY '):]
        if not body.startswith(old_body):
            raise ValueError(f'Refusing to alter existing captured entries: {path.name}')
        if previous == content:
            return
    # Only summary metadata is refreshed; the existing entry body must be an exact prefix.
    temporary = path.with_suffix('.tmp')
    temporary.write_text(content)
    temporary.replace(path)


def collect():
    cfg = json.loads(CONFIG.read_text())
    root = Path(cfg['session_store']).expanduser()
    accepted_cwds = [Path(p).resolve() for p in cfg['project_cwds']]
    for path in root.rglob('*.jsonl'):
        with path.open() as f:
            first_line = f.readline()
            try:
                first = json.loads(first_line)
            except json.JSONDecodeError:
                continue
            if first.get('type') != 'session_meta':
                continue
            meta = first['payload']
            cwd = Path(meta.get('cwd', '/')).resolve()
            if cwd not in accepted_cwds and not cwd.is_relative_to(ROOT):
                continue
            if meta.get('timestamp', '') < cfg['started_at']:
                continue
            records = [first]
            for line in f:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    break  # A partially flushed final line will be read next time.
        try:
            write_session(meta, extract(records), cfg['author'])
        except ValueError as error:
            print(f'{path.name}: {error}', flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--watch', action='store_true')
    args = parser.parse_args()
    (ROOT / '.agent-logs').mkdir(exist_ok=True)
    with (ROOT / '.capture/collector.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        while True:
            collect()
            (ROOT / '.capture/heartbeat.txt').write_text(dt.datetime.now(dt.timezone.utc).isoformat())
            if not args.watch:
                return
            time.sleep(2)

if __name__ == '__main__':
    main()
