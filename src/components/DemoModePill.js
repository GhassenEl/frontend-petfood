import React from 'react';

const DemoModePill = ({ label = 'Mode démo' }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 999,
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a',
    }}
  >
    {label}
  </span>
);

export default DemoModePill;
