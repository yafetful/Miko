import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { useAppAuth } from '../contexts/AuthContext';
import { CozeService } from 'shared';
import { useChat } from '../contexts/ChatContext';
import { authConfig } from '../config/auth';
import { DuotoneIcon } from './DuotoneIcon';
import { chatStorage } from '../utils/chatStorage';
import { ChatHistory } from './ChatHistory';

export function ChatDialog() {
  const [message, setMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isAuthenticated, publicKey } = useAppAuth();
  
  // 获取钱包地址字符串
  const walletAddress = publicKey?.toBase58();
  const [conversationId, setConversationId] = useState<string>();
  const lastCreatedConversationId = useRef<string>();  // 用于临时保存新创建的会话ID
  const [isCollectingMode, setIsCollectingMode] = useState(false);
  const collectedMessagesRef = useRef<any[]>([]);

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
    setLoading,
    handleStreamMessage
  } = useChat();

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
      setIsCollectingMode(false);  // 重置收集模式
      collectedMessagesRef.current = [];  // 清空收集的消息

      const currentMessage = message;
      setMessage('');

      addMessage({
        role: 'User',
        content: currentMessage,
      });

      await cozeService.streamChat({
        query: currentMessage,
        user_id: walletAddress,
        conversationId,
        onUpdate: (content) => {
          // 检查是否是收集指令
          if (typeof content === 'string' && content.startsWith('[miko]')) {
            setIsCollectingMode(true);
            return;
          }

          // 如果在收集模式，存储消息而不是立即显示
          if (isCollectingMode) {
            collectedMessagesRef.current.push(content);
            return;
          }

          // 普通流模式：直接更新显示
          const result = handleStreamMessage(content);
          if (result?.type !== 'buffering') {
            updateStreaming(result?.content);
          }
        },
        onSuccess: (content) => {
          // 如果在收集模式，添加最后一条消息并一次性显示所有内容
          if (isCollectingMode) {
            if (!isCompletionMessage(content)) {
              collectedMessagesRef.current.push(content);
            }
            addMessage({
              role: 'Assistant',
              content: collectedMessagesRef.current
            });
            setIsCollectingMode(false);
            collectedMessagesRef.current = [];
          } else {
            // 普通模式：直接添加消息
            if (!isCompletionMessage(content)) {
              addMessage({
                role: 'Assistant',
                content: content
              });
            }
          }
        },
        onCreated: (data) => {
          const newConversationId = data.conversation_id;
          setConversationId(newConversationId);
          lastCreatedConversationId.current = newConversationId;

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

  const isCompletionMessage = (content: any) => {
    return (
      content?.type === 'msg' &&
      content?.category === 'workflow' &&
      content?.message === 'done'
    );
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