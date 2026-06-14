import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const THEME_DARK_KEY = 'petfoodtn-theme-dark';
const THEME_MONOCHROME_KEY = 'petfoodtn-theme-monochrome';

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
  const [isMonochrome, setIsMonochrome] = useState(() => readStored(THEME_MONOCHROME_KEY));

  useLayoutEffect(() => {
    document.body.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(THEME_DARK_KEY, isDark ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isDark]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('monochrome', isMonochrome);
    document.body.classList.toggle('monochrome', isMonochrome);
    try {
      window.localStorage.setItem(THEME_MONOCHROME_KEY, isMonochrome ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isMonochrome]);

  const toggleDark = () => setIsDark((v) => !v);
  const toggleMonochrome = () => setIsMonochrome((v) => !v);

  const value = { isDark, isMonochrome, toggleDark, toggleMonochrome };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
