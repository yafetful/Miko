import { Box, Container } from '@mui/material';
import { ChatDialog } from '../components/ChatDialog';
import { ChatMessages } from '../components/ChatMessages';
import { SpineAnimation } from '../components/SpineAnimation';
import { Connect } from '../components/Connect';
import VrmViewer from '../components/vrmViewer';

export function ChatPage() {
  return (
    <>
      <VrmViewer />
      {/* 顶部连接钱包区域 */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        p: 2,
        zIndex: 100
      }}>
        <Connect />
      </Box>

      {/* 底部聊天区域 */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 64,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh',  // 限制最大高度
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
            zIndex: 1,  // 确保不会完全覆盖 VrmViewer
          }}>
            {/* 消息区域 */}
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              maxHeight: 'calc(80vh - 180px)',  // 减去输入框和动画的高度
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