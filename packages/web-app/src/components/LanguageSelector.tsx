import React, { useState, useContext } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { ViewerContext } from './vrmViewer/viewerContext';
import { speakCharacter } from './messages/speakCharacter';
import { i18n, STORAGE_KEY } from '../i18n/i18n';
import { useTranslation } from '../hooks/useTranslation';

export interface Language {
  code: string;
  label: string;
  audioPath: string;
  fullName: string;
}

export const LANGUAGES: Language[] = [
  { 
    code: 'en', 
    label: "Let's speak English", 
    audioPath: '/language/en.mp3',
    fullName: 'English'
  },
  { 
    code: 'zh', 
    label: "让我们说中文", 
    audioPath: '/language/zh.mp3',
    fullName: '中文'
  },
  { 
    code: 'ja', 
    label: "日本語を話しましょう", 
    audioPath: '/language/ja.mp3',
    fullName: '日本語'
  },
  { 
    code: 'ko', 
    label: "한국어를 말해요", 
    audioPath: '/language/ko.mp3',
    fullName: '한국어'
  },
  { 
    code: 'fr', 
    label: "Parlons français", 
    audioPath: '/language/fr.mp3',
    fullName: 'Français'
  },
  { 
    code: 'es', 
    label: "Hablemos español", 
    audioPath: '/language/es.mp3',
    fullName: 'Español'
  },
];

interface StoredLanguage {
  code: string;
  language: string;
}

export const getStoredLanguage = (): Language | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  
  const storedLang = JSON.parse(saved) as StoredLanguage;
  const language = LANGUAGES.find(lang => lang.code === storedLang.code);
  return language || null;
};

interface LanguageSelectorProps {
  onLanguageSelect: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const { viewer } = useContext(ViewerContext);
  const { t } = useTranslation();

  const playAudio = (lang: Language) => {
    speakCharacter(
      {
        expression: "neutral",
        talk: {
          message: lang.label,
          style: "talk",
          speakerX: 0,
          speakerY: 0
        }
      },
      viewer,
      undefined,
      () => {
        viewer?.resetExpressions();
      },
      {
        type: 'local',
        content: lang.audioPath
      }
    );
  };

  const handleLanguageSelect = async (lang: Language) => {
    playAudio(lang);
    setSelectedLang(lang);
    await i18n.setLocale(lang.code);
    console.log(lang.code);
  };

  const handleConfirm = async () => {
    if (selectedLang) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        code: selectedLang.code,
        language: selectedLang.fullName
      }));
      onLanguageSelect(selectedLang);
    }
  };

  return (
    <Container maxWidth="md">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          width: '100%',
          mb: 4
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          {t('language.select')}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2,
            width: '100%'
          }}
        >
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              variant="contained"
              className={selectedLang?.code === lang.code ? 'Mui-selected' : ''}
              sx={{
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => handleLanguageSelect(lang)}
            >
              {lang.label}
            </Button>
          ))}
        </Box>
        
        <Button
          variant="contained"
          color="success"
          disabled={!selectedLang}
          sx={{ 
            py: 1.5,
            px: 4,
            minWidth: 200
          }}
          onClick={handleConfirm}
        >
          {t('common.confirm')}
        </Button>
      </Box>
    </Container>
  );
};

export default LanguageSelector; 