import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const THEME_DARK_KEY = 'petfoodtn-theme-dark';

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

  useLayoutEffect(() => {
    document.body.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(THEME_DARK_KEY, isDark ? '1' : '0');
      window.localStorage.removeItem('petfoodtn-theme-monochrome');
    } catch {
      /* ignore */
    }
    document.body.classList.remove('monochrome');
  }, [isDark]);

  const toggleDark = () => setIsDark((v) => !v);

  const value = { isDark, toggleDark };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
