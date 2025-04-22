import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { QueueProvider } from './context/QueueContext.jsx';
import './index.css'; // Import Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueueProvider>
      <App />
    </QueueProvider>
  </React.StrictMode>,
);