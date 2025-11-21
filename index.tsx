import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode can interfere with drag and drop in development (double mount), 
  // but hello-pangea/dnd usually handles it well. Keeping it for best practices.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
