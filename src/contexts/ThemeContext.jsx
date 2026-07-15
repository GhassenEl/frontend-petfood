import React, { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react';

const THEME_DARK_KEY = 'petfoodtn-theme-dark';
const THEME_MONO_KEY = 'petfoodtn-theme-monochrome';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const useDarkTheme = useTheme;

const readStored = (key) => {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => readStored(THEME_DARK_KEY));
  const [isMonochrome, setIsMonochrome] = useState(() => readStored(THEME_MONO_KEY));

  useLayoutEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('monochrome', isMonochrome);
    document.body.classList.toggle('monochrome', isMonochrome);
    try {
      window.localStorage.setItem(THEME_DARK_KEY, isDark ? '1' : '0');
      window.localStorage.setItem(THEME_MONO_KEY, isMonochrome ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isDark, isMonochrome]);

  const toggleDark = useCallback(() => setIsDark((v) => !v), []);
  const toggleMonochrome = useCallback(() => setIsMonochrome((v) => !v), []);

  const value = { isDark, toggleDark, isMonochrome, toggleMonochrome };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
