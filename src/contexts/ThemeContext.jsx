import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const THEME_STORAGE_KEY = 'petfoodtn-theme-dark';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const useDarkTheme = useTheme;

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useLayoutEffect(() => {
    document.body.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((v) => !v);

  const value = { isDark, toggleDark };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

