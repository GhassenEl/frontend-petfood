import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const btnStyle = {
  width: '100%',
  justifyContent: 'flex-start',
  padding: '12px 14px',
  marginBottom: '8px',
};

const ThemeToggles = () => {
  const { isDark, toggleDark } = useTheme();

  return (
    <button type="button" onClick={toggleDark} className="btn btn-outline" style={btnStyle}>
      <span>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
    </button>
  );
};

export default ThemeToggles;
