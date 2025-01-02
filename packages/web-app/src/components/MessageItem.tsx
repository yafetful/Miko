import React, { useContext } from 'react';
import { Box, Paper, Typography, Avatar, IconButton } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { ViewerContext } from './vrmViewer/viewerContext';
import { speakCharacter } from './messages/speakCharacter';
import { DuotoneIcon } from './DuotoneIcon';
import { VoicePresets, type LanguageCode } from '@shared/elevenlabs';
import { useTranslation } from '../hooks/useTranslation';

// 动画定义
const moveUpAnimation = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-40px);
  }
`;

const enterAnimation = keyframes`
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export interface Message {
  role: 'User' | 'Assistant';
  content: string;
  timestamp: number;
  id?: string;
}

interface MessageItemProps {
  message: Message;
  isMovingUp: boolean;
  isEntering: boolean;
  publicKey?: any;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isMovingUp,
  isEntering,
}) => {
  const isUser = message.role === 'User';
  const { viewer } = useContext(ViewerContext);
  const { currentLocale } = useTranslation();
  
  const handleSpeak = () => {
    if (!isUser) {
      const langCode = currentLocale as LanguageCode;
      console.log('Current language code:', langCode);

      const voiceId = VoicePresets[langCode]?.voice_id || VoicePresets.en.voice_id;

      speakCharacter(
        {
          expression: "neutral",
          talk: {
            message: message.content,
            style: "talk",
            speakerX: 0,
            speakerY: 0
          },
          voice_id: voiceId,
          timestamp: message.timestamp
        },
        viewer,
        undefined,
        () => {
          viewer?.resetExpressions();
        }
      );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        px: { xs: '0px', sm: isUser ? '0px' : '50px' },
        width: { xs: '100%', sm: '80%' },
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        willChange: 'transform',
        animation: isMovingUp 
          ? `${moveUpAnimation} 0.3s linear forwards`
          : isEntering
            ? `${enterAnimation} 0.3s linear`
            : 'none',
      }}
    >
      <Box sx={{ 
        [isUser ? 'mr' : 'ml']: 2, 
        py: 1,
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
      }}>
        {isUser ? (
          <>
            <Typography variant="h6">You</Typography>
            <Avatar sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              boxShadow: 3,
              borderRadius: '8px',
            }}>U</Avatar>
          </>
        ) : (
          <>
            <Avatar
              src="/assets/Miko.png"
              alt="Miko"
              variant="square"
              sx={{
                width: 48,
                height: 48,
                boxShadow: 3,
                borderRadius: '8px',
              }}
            />
            <Typography variant="h6">Miko</Typography>
          </>
        )}
      </Box>
      <Paper sx={{
        p: 2,
        width: 'auto',
        maxWidth: '100%',
        borderRadius: 2,
        border: 2,
        borderColor: isUser ? 'primary.main' : 'secondary.main',
        backgroundColor: 'background.paper',
        boxShadow: 3,
        display: 'inline-block',
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}>
            {message.content}
          </Typography>
          {!isUser && (
            <IconButton
              onClick={handleSpeak}
              size="small"
              sx={{
                opacity: 0.6,
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <DuotoneIcon icon="solar:volume-loud-bold-duotone" size="small" />
            </IconButton>
          )}
        </Box>
      </Paper>
    </Box>
  );
}; 