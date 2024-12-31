import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { ChatDialog } from '../components/ChatDialog';
import { ChatMessages } from '../components/ChatMessages';
import { SpineAnimation } from '../components/SpineAnimation';
import { Connect } from '../components/Connect';
import VrmViewer from '../components/vrmViewer';
import { JsonViewer } from '../components/JsonViewer';
import { useJsonCollector } from '../contexts/JsonCollectorContext';

export const ChatPage: React.FC = () => {
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

      {/* JsonViewer 始终存在，由内部控制展开/收起状态 */}
      <JsonViewer />
    </>
  );
}; 