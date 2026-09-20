import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {ShopProvider} from './state/ShopContext.jsx';
import App from './App.jsx';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><ShopProvider><App/></ShopProvider></BrowserRouter></React.StrictMode>);
