import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { ChatPage } from './pages/ChatPage';
import { ChatProvider } from './contexts/ChatContext';
import { Global } from '@emotion/react';
import { globalStyles } from './theme/globalStyles';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('isDarkMode').then(result => {
      setIsDarkMode(result.isDarkMode ?? false);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ isDarkMode });
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Global styles={globalStyles} />
      <ChatProvider>
          <Box sx={{ 
            minWidth: '400px',
            width: '100%',
            height: '100vh',
            minHeight: '620px',
            overflow: 'hidden'
          }}>
            <ChatPage setDarkMode={setIsDarkMode} isDarkMode={isDarkMode} />
          </Box>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;