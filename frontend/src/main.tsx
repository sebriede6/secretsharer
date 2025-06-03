import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Importiere BrowserRouter
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Umschließe App mit BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);