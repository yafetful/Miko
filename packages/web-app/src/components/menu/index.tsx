import React from 'react';
import { Box } from '@mui/material';
import { Connect } from './Connect';
import { LanguageMenu } from './LanguageMenu';
import { ThemeToggle } from './ThemeToggle';

interface MenuBarProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
  showLanguageMenu?: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({ 
  isDarkMode, 
  onThemeChange,
  showLanguageMenu = true 
}) => {
  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 16,
      left: 16,
      right: 16,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Box>
        <Connect />
      </Box>

      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <LanguageMenu show={showLanguageMenu} />
        <ThemeToggle isDarkMode={isDarkMode} onThemeChange={onThemeChange} />
      </Box>
    </Box>
  );
};

export { Connect } from './Connect';
export { LanguageMenu } from './LanguageMenu';
export { ThemeToggle } from './ThemeToggle'; 