import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { lightTheme, darkTheme } from './theme';
import { ChatPage } from './pages/ChatPage';
import { ChatProvider } from './contexts/ChatContext';
import { Global } from '@emotion/react';
import { globalStyles } from './theme/globalStyles';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初始化时先获取存储的设置，如果没有则使用系统主题
  useEffect(() => {
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    chrome.storage.local.get(['isDarkMode']).then(result => {
      if (result.isDarkMode === undefined) {
        setIsDarkMode(systemDarkMode);
      } else {
        setIsDarkMode(result.isDarkMode);
      }
    });

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      chrome.storage.local.get(['isDarkMode']).then(result => {
        // 只有当用户没有手动设置过主题时，才跟随系统变化
        if (result.isDarkMode === undefined) {
          setIsDarkMode(e.matches);
        }
      });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 保存用户的手动设置
  useEffect(() => {
    chrome.storage.local.set({ isDarkMode });
  }, [isDarkMode]);

  const toggleColorMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Global styles={globalStyles} />
      <ChatProvider>
        <Box sx={{ 
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'flex-end',
            position: 'relative',
          }}>
            <IconButton 
              onClick={toggleColorMode} 
              color="inherit" 
              size="small"
              sx={{
                position: 'relative',
                zIndex: 1000
              }}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <ChatPage setDarkMode={setIsDarkMode} isDarkMode={isDarkMode} />
          </Box>
        </Box>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
