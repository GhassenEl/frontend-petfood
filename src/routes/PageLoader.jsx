import React from 'react';

const PageLoader = ({ label = 'Chargement…' }) => (
  <div className="app-auth-loading" style={{ minHeight: '40vh' }} role="status" aria-live="polite">
    <div className="app-auth-loading__mark" aria-hidden>🐾</div>
    <p className="app-auth-loading__text">{label}</p>
  </div>
);

export default PageLoader;
