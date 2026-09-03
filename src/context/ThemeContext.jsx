import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('chronos_theme_mode');
    if (saved !== null) {
      return saved === 'dark';
    }
    return true; // Default to luxury dark mode
  });

  useEffect(() => {
    localStorage.setItem('chronos_theme_mode', isDarkMode ? 'dark' : 'light');

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setTheme = (mode) => {
    setIsDarkMode(mode === 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme: isDarkMode ? 'dark' : 'light',
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
