import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeSwitcher = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 group cursor-pointer ${
        isDarkMode
          ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
          : 'bg-black/05 hover:bg-black/10 text-gray-700'
      } ${className}`}
    >
      {isDarkMode ? (
        <Sun className="w-4.5 h-4.5 text-yellow-400 group-hover:text-yellow-300 transition" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-gray-600 group-hover:text-gray-900 transition" />
      )}
    </button>
  );
};
