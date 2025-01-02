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
import { useJsonCollector } from '../contexts/JsonCollectorContext';
export function ChatDialog() {
  // State for managing input message and history dialog
  const [message, setMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  // Get authentication state and wallet address
  const { isAuthenticated, publicKey } = useAppAuth();
  const walletAddress = publicKey?.toBase58();
  
  // Custom hooks for handling commands, input events, and chat history
  const { executeCommand } = useCommandHandler();
  const { handleKeyDown } = useInputHandler();
  const { 
    conversationId, 
    setConversationId, 
    lastCreatedConversationId,
    saveMessage 
  } = useChatHistory(walletAddress);

  // Initialize Coze service for AI chat
  const [cozeService] = useState(() => new CozeService({
    pat: authConfig.patToken,
    baseUrl: authConfig.baseUrl,
    botId: authConfig.botId,
  }));

  // Get chat context states and methods
  const {
    state: { loading },
    addMessage,
    updateStreaming,
    clearStreaming,
    setLoading
  } = useChat();

  const { addJson } = useJsonCollector();

  // Handle form submission and chat interaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !walletAddress) return;

    try {
      setLoading(true);
      clearStreaming();

      // Save and clear current message
      const currentMessage = message;
      setMessage('');
      addMessage({ role: 'User', content: currentMessage });
      saveMessage(currentMessage, 'User');

      // Start chat stream with AI
      await cozeService.streamChat({
        query: currentMessage,
        user_id: walletAddress,
        conversationId,
        // Handle streaming updates for real-time response
        onUpdate: (result) => {
          if(result.type === 'text' && !result.isCommand) {
            updateStreaming(result.content);
          } 
        },
        // Process final response
        onSuccess: (result) => {
          if (result.isCommand) {
            // Execute command if response is a command
            executeCommand(result.content);
          }else if(result.type === 'json'){
            addJson(result.content);
          } else {
            // Add normal message to chat
            addMessage({
              role: 'Assistant',
              content: result.content,
            });
            saveMessage(result.content, 'Assistant');
          }
        },
        // Handle new conversation creation
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

  // Render chat interface
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
        alignItems: 'center'
      }}>
        {/* History button */}
        <Box sx={{ 
          width: 40,
          height: 40,
          flexShrink: 0,
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

        {/* Chat input field */}
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
                {/* Clear input button */}
                {message && (
                  <IconButton onClick={() => setMessage('')} size="small" color='default'>
                    <DuotoneIcon icon="solar:close-circle-bold-duotone" size="small" />
                  </IconButton>
                )}
                {/* Submit button */}
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

        {/* Chat history dialog */}
        <ChatHistory 
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </Box>
    </Box>
  );
}