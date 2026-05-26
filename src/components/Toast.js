import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bg = type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#eaf2ff';
  const color = type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#1e3a8a';

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 1600 }}>
      <div style={{ background: bg, color, padding: '12px 16px', borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.12)', minWidth: 220, fontWeight: 700 }}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
