import React from 'react';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onThemeChange }) => {
  return (
    <IconButton
      onClick={() => onThemeChange(!isDarkMode)}
      color="primary"
    >
      {isDarkMode ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
}; 