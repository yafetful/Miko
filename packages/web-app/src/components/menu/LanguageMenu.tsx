import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemText, Tooltip } from '@mui/material';
import { Translate } from '@mui/icons-material';
import { LANGUAGES } from '../LanguageSelector';
import { i18n, STORAGE_KEY } from '../../i18n/i18n';
import { useTranslation } from '../../hooks/useTranslation';

interface LanguageMenuProps {
  show?: boolean;
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({ show = true }) => {
  // 如果不显示，直接返回 null
  if (!show) return null;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLocale } = useTranslation();

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = async (code: string) => {
    const selectedLang = LANGUAGES.find(lang => lang.code === code);
    if (selectedLang) {
      // 更新本地缓存
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        code: selectedLang.code,
        language: selectedLang.fullName
      }));
      
      // 切换语言
      await i18n.setLocale(code);
    }
    handleLanguageMenuClose();
  };

  const getCurrentLanguageName = () => {
    const lang = LANGUAGES.find(lang => lang.code === currentLocale);
    return lang?.fullName || 'English';
  };

  return (
    <>
      <Tooltip title={getCurrentLanguageName()}>
        <IconButton
          onClick={handleLanguageMenuOpen}
          sx={{ mr: 1 }}
          color="primary"
        >
          <Translate />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            selected={currentLocale === lang.code}
          >
            <ListItemText>
              {lang.fullName}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}; 