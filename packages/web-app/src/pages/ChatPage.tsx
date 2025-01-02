import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { ChatDialog } from '../components/ChatDialog';
import { ChatMessages } from '../components/ChatMessages';
import { SpineAnimation } from '../components/SpineAnimation';
import VrmViewer from '../components/vrmViewer';
import { JsonViewer } from '../components/JsonViewer';
import LanguageSelector, { Language, getStoredLanguage } from '../components/LanguageSelector';
import { MenuBar } from '../components/menu/index';

interface ChatPageProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ isDarkMode, onThemeChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(() => getStoredLanguage());

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <VrmViewer />
      <MenuBar 
        isDarkMode={isDarkMode}
        onThemeChange={onThemeChange}
        showLanguageMenu={!!selectedLanguage}
      />
      
      {!selectedLanguage ? (
        <Box sx={{
          display: 'flex',
          position: 'fixed',
          bottom: '80px',
          left: 0,
          right: 0,
          zIndex: 100
        }}>
          <LanguageSelector onLanguageSelect={handleLanguageSelect} />
        </Box>
      ) : (
        <>
          {/* Chat area at the bottom */}
          <Box sx={{ 
            position: 'fixed',
            bottom: 64,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '80vh',
          }}>
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center'}}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '100%',
                width: {
                  xs: '100%',
                  md: '80%'
                },
                position: 'relative',
                zIndex: 1,
              }}>
                {/* Message display area */}
                <Box sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  maxHeight: 'calc(80vh - 180px)',
                }}>
                  <ChatMessages />
                </Box>
                {/* Animation and input area */}
                <Box>
                  <SpineAnimation />
                  <ChatDialog />
                </Box>
              </Box>
            </Container>
          </Box>
          <JsonViewer />
        </>
      )}
    </Box>
  );
}; 