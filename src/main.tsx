
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAppSecurity } from './utils/initializeSecurity';
import { BannerProvider } from './context/BannerContext';

// Initialize security features
initializeAppSecurity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BannerProvider>
      <App />
    </BannerProvider>
  </React.StrictMode>,
);
