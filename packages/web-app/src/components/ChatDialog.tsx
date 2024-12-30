import { useState } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { useAppAuth } from '../contexts/AuthContext';
import { CozeService } from 'shared';
import { useChat } from '../contexts/ChatContext';
import { authConfig } from '../config/auth';
import { DuotoneIcon } from './DuotoneIcon';
import { ChatHistory } from './ChatHistory';
import { useCommandHandler } from '../hooks/useCommandHandler';
import { useInputHandler } from '../hooks/useInputHandler';
import { useChatHistory } from '../hooks/useChatHistory';

export function ChatDialog() {
  const [message, setMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isAuthenticated, publicKey } = useAppAuth();
  const walletAddress = publicKey?.toBase58();
  
  const { commandService, executeCommand } = useCommandHandler();
  const { handleKeyDown } = useInputHandler();
  const { 
    conversationId, 
    setConversationId, 
    lastCreatedConversationId,
    saveMessage 
  } = useChatHistory(walletAddress);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !walletAddress) return;

    try {
      setLoading(true);
      clearStreaming();

      const currentMessage = message;
      setMessage('');
      addMessage({ role: 'User', content: currentMessage });
      saveMessage(currentMessage, 'User');

      await cozeService.streamChat({
        query: currentMessage,
        user_id: walletAddress,
        conversationId,
        onUpdate: (result) => {
          if(result.type === 'text' && !result.isCommand) {
            updateStreaming(result.content);
          }
        },
        onSuccess: (result) => {
          if (result.isCommand) {
            executeCommand(result.content);
          } else {
            addMessage({
              role: 'Assistant',
              content: result.content,
            });
            saveMessage(result.content, 'Assistant');
          }
        },
        onCreated: (data) => {
          const newConversationId = data.conversation_id;
          setConversationId(newConversationId);
          lastCreatedConversationId.current = newConversationId;
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
                  <IconButton onClick={() => setMessage('')} size="small" color='default'>
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