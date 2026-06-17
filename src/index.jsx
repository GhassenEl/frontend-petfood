import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './App.css';
import './styles/mobile.css';
import './styles/platform-enhancements.css';

import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PlatformLiveProvider } from './contexts/PlatformLiveContext.jsx';
import PresenceTracker from './components/PresenceTracker.jsx';
import App from './App.js';
import ScrollToTop from './components/ScrollToTop.js';
import { initSentry } from './utils/sentry.js';

initSentry();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <PlatformLiveProvider>
            <PresenceTracker />
            <App />
          </PlatformLiveProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

