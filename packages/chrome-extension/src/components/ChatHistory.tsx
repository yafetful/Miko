import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Button
} from '@mui/material';
import { DuotoneIcon } from './DuotoneIcon';
import { chatStorage } from '../utils/chatStorage';

interface ChatMessage {
  role: 'User' | 'Assistant';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface ChatHistoryProps {
  open: boolean;
  onClose: () => void;
}

export function ChatHistory({ open, onClose }: ChatHistoryProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [history, setHistory] = useState<{conversations: Record<string, Conversation>} | null>(null);

  // 加载历史记录
  useEffect(() => {
    if (open) {
      chatStorage.getHistory().then(result => {
        setHistory(result);
      });
    }
  }, [open]);

  const handleClearHistory = async () => {
    await chatStorage.clearAllHistory();
    setHistory(null);
    onClose();
  };

  const handleClose = () => {
    if (closeButtonRef.current) {
      closeButtonRef.current.blur();
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableRestoreFocus
      keepMounted={false}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography component="span" variant="h6">
          Chat History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleClearHistory}
            color="error"
            startIcon={<DuotoneIcon icon="solar:trash-bin-trash-bold-duotone" />}
          >
            Clear All
          </Button>
          <IconButton 
            onClick={handleClose} 
            size="small"
            ref={closeButtonRef}
          >
            <DuotoneIcon icon="solar:close-circle-bold-duotone" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!history || Object.keys(history.conversations).length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No chat history
          </Typography>
        ) : (
          <List>
            {Object.values(history.conversations)
              .sort((a, b) => b.lastUpdated - a.lastUpdated)
              .map((conversation: Conversation) => (
                <Box key={conversation.id}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    {new Date(conversation.lastUpdated).toLocaleString()}
                  </Typography>
                  {conversation.messages.map((msg, index) => (
                    <ListItem 
                      key={index}
                      sx={{
                        flexDirection: 'column',
                        alignItems: msg.role === 'User' ? 'flex-end' : 'flex-start',
                        gap: 0.5
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                      >
                        {msg.role}
                      </Typography>
                      <Box
                        sx={{
                          maxWidth: '80%',
                          bgcolor: msg.role === 'User' ? 'primary.main' : 'background.paper',
                          color: msg.role === 'User' ? 'primary.contrastText' : 'text.primary',
                          p: 2,
                          borderRadius: 1
                        }}
                      >
                        <Typography>{msg.content}</Typography>
                      </Box>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
} 