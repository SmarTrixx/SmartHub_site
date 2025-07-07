import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Note the `/client`
import App from './App';
import './index.css'; // or './App.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
