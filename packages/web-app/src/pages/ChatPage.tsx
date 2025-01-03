import React, { useState, useRef } from 'react';
import { Box, Container } from '@mui/material';
import { ChatDialog } from '../components/ChatDialog';
import { ChatMessages } from '../components/ChatMessages';
import { SpineAnimation } from '../components/SpineAnimation';
import VrmViewer from '../components/vrmViewer';
import { JsonViewer } from '../components/JsonViewer';
import LanguageSelector, { Language, getStoredLanguage } from '../components/LanguageSelector';
import { MenuBar } from '../components/menu/index';
import { Chart } from '../components/chart';
import mockData from '../components/chart/data.json';

interface ChatPageProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ isDarkMode, onThemeChange }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(() => getStoredLanguage());
  const [sliderValue, setSliderValue] = useState(0);
  const chartRef = useRef<any>(null);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (chartRef.current?.updateDataPoint) {
      chartRef.current.updateDataPoint(value);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', zIndex: 1001 }}>
        <MenuBar 
          isDarkMode={isDarkMode}
          onThemeChange={onThemeChange}
          showLanguageMenu={!!selectedLanguage}
          sliderValue={sliderValue}
          sliderMax={mockData.data.length - 1}
          onSliderChange={handleSliderChange}
        />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 0 }}>
        <Chart 
          type='line' 
          height={800}
          ref={chartRef}
        />
      </Box>

      <VrmViewer />
      
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
                <Box sx={{ 
                  flex: 1,
                  overflow: 'auto',
                  maxHeight: 'calc(80vh - 180px)',
                }}>
                  <ChatMessages />
                </Box>
                <Box>
                  <SpineAnimation />
                  <ChatDialog />
                </Box>
              </Box>
            </Container>
          </Box>
          <Box sx={{ position: 'relative', zIndex: 999 }}>
            <JsonViewer />
          </Box>
        </>
      )}
    </Box>
  );
}; 