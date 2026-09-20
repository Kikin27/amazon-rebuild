#!/usr/bin/env python3
"""Idempotent startup for the automatic collector (no per-message commands)."""
import datetime as dt
import subprocess
import sys
import time
from pathlib import Path
root = Path(__file__).resolve().parents[1]
heartbeat = root / '.capture/heartbeat.txt'
def healthy():
    try:
        return (dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(heartbeat.read_text())).total_seconds() < 8
    except (OSError, ValueError):
        return False
if not healthy():
    with (root/'.capture/collector.out').open('a') as out, (root/'.capture/collector.err').open('a') as err:
        subprocess.Popen([sys.executable,str(root/'scripts/capture.py'),'--watch'],cwd=root,stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True,close_fds=True)
    for _ in range(40):
        if healthy(): break
        time.sleep(.25)
if not healthy():
    raise SystemExit('Capture collector did not start. Do not continue assignment work.')
print('Automatic capture collector is active.')
