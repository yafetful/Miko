import { Box, Container } from '@mui/material';
import { ChatDialog } from '../components/ChatDialog';
import { ChatMessages } from '../components/ChatMessages';
import { SpineAnimation } from '../components/SpineAnimation';
import VrmViewer from '../components/vrmViewer';

interface ChatPageProps {
  setDarkMode: (isDark: boolean) => void;
  isDarkMode: boolean;
}

export function ChatPage({ setDarkMode, isDarkMode }: ChatPageProps) {
  return (
    <>
      <VrmViewer />
      {/* 底部聊天区域 */}
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
              xs: '100%',  // 小屏幕时宽度 100%
              md: '80%'    // 中等及以上屏幕时宽度 80%
            },
            position: 'relative',
            zIndex: 1,
          }}>
            {/* 消息区域 */}
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              maxHeight: 'calc(80vh - 180px)',
            }}>
              <ChatMessages />
            </Box>

            {/* 动画和输入框区域 */}
            <Box>
              <SpineAnimation />
              <ChatDialog />
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
} 