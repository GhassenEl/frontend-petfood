import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './GlobalMonochromeToggle.css';

/** Bouton noir & blanc global — visible sur toute la plateforme web. */
const GlobalMonochromeToggle = () => {
  const { isMonochrome, toggleMonochrome } = useTheme();

  return (
    <button
      type="button"
      className={`global-mono-fab${isMonochrome ? ' is-active' : ''}`}
      onClick={toggleMonochrome}
      aria-pressed={isMonochrome}
      aria-label={isMonochrome ? 'Réactiver les couleurs' : 'Activer le mode noir et blanc'}
      title={isMonochrome ? 'Couleurs' : 'Noir & blanc'}
    >
      <span className="global-mono-fab__icon" aria-hidden>
        {isMonochrome ? '🎨' : '◐'}
      </span>
      <span className="global-mono-fab__label">{isMonochrome ? 'Couleurs' : 'Noir & blanc'}</span>
    </button>
  );
};

export default GlobalMonochromeToggle;
