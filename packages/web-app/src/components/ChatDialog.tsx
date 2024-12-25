import { useState, useEffect, useRef, useContext } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { useAppAuth } from '../contexts/AuthContext';
import { CozeService } from 'shared';
import { useChat } from '../contexts/ChatContext';
import { authConfig } from '../config/auth';
import { DuotoneIcon } from './DuotoneIcon';
import { chatStorage } from '../utils/chatStorage';
import { ChatHistory } from './ChatHistory';
import { ViewerContext } from "./vrmViewer/viewerContext";
import { color } from 'three/src/nodes/TSL.js';

export function ChatDialog() {
  const [message, setMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isAuthenticated, publicKey } = useAppAuth();
  
  // 获取钱包地址字符串
  const walletAddress = publicKey?.toBase58();
  const [conversationId, setConversationId] = useState<string>();
  const lastCreatedConversationId = useRef<string>();  // 用于临时保存新创建的会话ID

  // 加载最后的会话ID
  useEffect(() => {
    if (walletAddress) {
      const history = chatStorage.getHistory(walletAddress);
      if (history) {
        // 获取最后更新的会话ID
        const sortedConversations = Object.values(history.conversations)
          .sort((a, b) => b.lastUpdated - a.lastUpdated);
        
        if (sortedConversations.length > 0) {
          setConversationId(sortedConversations[0].id);
        }
      }
    }
  }, [walletAddress]);

  const [cozeService] = useState(() => new CozeService({
    pat: authConfig.patToken,
    baseUrl: authConfig.baseUrl,
    botId: authConfig.botId,
  }));

  const {
    state: { loading },
    addMessage,
    updateStreaming,
    clearStreaming,
    setLoading
  } = useChat();

  const { viewer } = useContext(ViewerContext);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // 处理字母键
    if (event.code.startsWith('Key')) {
      const char = event.code.slice(3).toLowerCase();
      const customEvent = new CustomEvent('character-input', {
        detail: { char }
      });
      window.dispatchEvent(customEvent);
    }
    // 处理回车键
    else if (event.code === 'Enter') {
      const customEvent = new CustomEvent('character-input', {
        detail: { char: 'enter' }
      });
      window.dispatchEvent(customEvent);
    }
    // 处理标点符号
    else {
      const codeMap: Record<string, string> = {
        'Period': '.',
        'Slash': '?',
        'Space': ' ',
        'Digit1': '!',  // 添加叹号映射
      };

      const char = codeMap[event.code] || event.key;

      if ([' ', '?', '!', '.'].includes(char)) {
        const customEvent = new CustomEvent('character-input', {
          detail: { char }
        });
        window.dispatchEvent(customEvent);
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !walletAddress) return;

    try {
      setLoading(true);
      clearStreaming();

      // 立即清除输入框
      const currentMessage = message;  // 保存当前消息
      setMessage('');  // 立即清除输入框

      // 添加用户消息到界面
      addMessage({
        role: 'User',
        content: currentMessage,  // 使用保存的消息
      });

      await cozeService.streamChat({
        query: currentMessage,  // 使用保存的消息
        user_id: walletAddress,
        conversationId,
        onUpdate: (content) => {
          updateStreaming(content);
        },
        onSuccess: (content) => {
          addMessage({
            role: 'Assistant',
            content: content,
          });

          // 现在可以访问 viewer 了
          viewer?.model?.playRandomAction();

          // 确保有 conversationId 时保存 AI 响应
          const currentConversationId = conversationId || lastCreatedConversationId.current;
          if (currentConversationId) {
            chatStorage.saveMessage(walletAddress, currentConversationId, {
              role: 'Assistant',
              content: content,
              timestamp: Date.now()
            });
          }
        },
        onCreated: (data) => {
          const newConversationId = data.conversation_id;
          setConversationId(newConversationId);
          lastCreatedConversationId.current = newConversationId;

          // 只在这里保存用户消息
          chatStorage.saveMessage(walletAddress, newConversationId, {
            role: 'User',
            content: currentMessage,
            timestamp: Date.now()
          });
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'Assistant',
        content: 'Error: Failed to get response',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessage('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        width: '100%',
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        flex: 1, 
        display: 'flex', 
        gap: 1,
        alignItems: 'center'  // 确保子元素垂直居中
      }}>
        <Box sx={{ 
          width: 40,     // 固定宽度
          height: 40,    // 固定高度
          flexShrink: 0, // 防止压缩
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconButton 
            onClick={() => setHistoryOpen(true)} 
            size="medium"
          >
            <DuotoneIcon icon="solar:chat-round-dots-bold-duotone" size="medium" />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          autoComplete='off'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAuthenticated ? "Type your message..." : "Please connect wallet and sign in first"}
          disabled={!isAuthenticated}
          sx={{
            bgcolor:'background.paper',
            borderRadius: '32px',
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ display: 'flex', gap: 1 }}>
                {message && (
                  <IconButton onClick={handleClear} size="small" color='default'>
                    <DuotoneIcon icon="solar:close-circle-bold-duotone" size="small" />
                  </IconButton>
                )}
                <IconButton
                  type="submit"
                  disabled={!isAuthenticated || !message.trim() || loading}
                  sx={{ color: 'primary.main' }}
                  size="medium"
                >
                  <DuotoneIcon icon="solar:map-arrow-right-bold" size="medium" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <ChatHistory 
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </Box>
    </Box>
  );
}