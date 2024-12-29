import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, IconButton, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';
import { ChatPage } from './pages/ChatPage';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { ChatProvider } from './contexts/ChatContext';
import { AuthProvider } from './contexts/AuthContext';
import { Global } from '@emotion/react';
import { globalStyles } from './theme/globalStyles';
import { DuotoneIcon } from './components/DuotoneIcon';

import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  console.log('App rendered', {
    env: {
      clientId: process.env.REACT_APP_COZE_CLIENT_ID,
      baseUrl: process.env.REACT_APP_COZE_BASE_URL,
      url: process.env.REACT_APP_URL,
    },
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 可以根据需要选择网络
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  // 初始化钱包适配器
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Global styles={globalStyles} />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <AuthProvider>
                <ChatProvider>
                  <Router>
                    <IconButton
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
                    >
                      {isDarkMode ? <DuotoneIcon icon="solar:sun-bold-duotone" size="medium" /> : <DuotoneIcon icon="solar:moon-bold-duotone" size="medium" />}
                    </IconButton>
                    <Routes>
                      <Route path="/" element={<ChatPage />} />
                    </Routes>
                  </Router>
                </ChatProvider>
              </AuthProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App; 