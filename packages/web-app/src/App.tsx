import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
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
import { JsonCollectorProvider } from './contexts/JsonCollectorContext';
import { initI18n } from './i18n/i18n';

import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
        setIsI18nReady(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      }
    };
    init();
  }, []);

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  if (!isI18nReady) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        Loading...
      </Box>
    );
  }

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
                  <JsonCollectorProvider>
                    <Router>
                      <Routes>
                        <Route path="/" element={
                          <ChatPage 
                            isDarkMode={isDarkMode}
                            onThemeChange={setIsDarkMode}
                          />
                        } />
                      </Routes>
                    </Router>
                  </JsonCollectorProvider>
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