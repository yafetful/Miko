import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Avatar, keyframes } from '@mui/material';
import { useChat } from '../contexts/ChatContext';
import { useAppAuth } from '../contexts/AuthContext';
import { chatStorage } from '../utils/chatStorage';

// 定义消息向上移动的动画
const moveUpAnimation = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-40px); // 向上移动的距离
  }
`;

// 定义新消息进入的动画
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

type Message = {
  role: 'User' | 'Assistant';
  content: string;
  timestamp: number; // 使用 timestamp 作为 ID
};

type MessageItemProps = {
  message: Message;
  isMovingUp: boolean;
  isEntering: boolean;
  publicKey?: any;
};

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isMovingUp,
  isEntering,
  publicKey,
}) => {
  const isUser = message.role === 'User';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        px: '50px',
        mb: 2,
        maxWidth: '80%',
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
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
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
            }}>
              {publicKey?.toBase58().slice(0, 2).toUpperCase()}
            </Avatar>
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
        width: '100%',
        borderRadius: 2,
        border: 2,
        borderColor: isUser ? 'primary.main' : 'secondary.main',
        backgroundColor: 'background.paper',
        boxShadow: 3,
      }}>
        <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export function ChatMessages() {
  const MAX_VISIBLE_MESSAGES = 2; // 可配置的最大显示消息数
  const { state } = useChat();
  const { publicKey } = useAppAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMovingUp, setIsMovingUp] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  // 加载历史记录
  useEffect(() => {
    const walletAddress = publicKey?.toBase58();
    if (walletAddress && state.messages.length === 0) {
      const history = chatStorage.getHistory(walletAddress);
      if (history) {
        const lastConversation = Object.values(history.conversations)
          .sort((a, b) => b.lastUpdated - a.lastUpdated)[0];

        if (lastConversation) {
          const historyMessages = lastConversation.messages
            .slice(-MAX_VISIBLE_MESSAGES)
            .map(msg => ({
              ...msg,
              timestamp: msg.timestamp || Date.now() // 使用现有的 timestamp 或创建新的
            }));
          setMessages(historyMessages);
        }
      }
    }
  }, [publicKey]);

  // 监听新消息
  useEffect(() => {
    if (state.messages.length > 0) {
      const latestMessage = state.messages[state.messages.length - 1];
      const newMessage = {
        ...latestMessage,
        timestamp: Date.now() // 使用当前时间戳
      };

      if (messages.length > 0) {
        setIsMovingUp(true);
        setTimeout(() => {
          setMessages(prev => {
            const newMessages = [...prev, newMessage].slice(-MAX_VISIBLE_MESSAGES);
            setIsMovingUp(false);
            setIsEntering(true);
            return newMessages;
          });
        }, 300);
      } else {
        setMessages([newMessage]);
        setIsEntering(true);
      }
    }
  }, [state.messages.length]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      flex: 1, 
      overflow: 'auto',
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      py: 2,
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {messages.map((message, index) => (
        <MessageItem
          key={message.timestamp}
          message={message}
          isMovingUp={isMovingUp && index < messages.length - 1}
          isEntering={isEntering && index === messages.length - 1}
          publicKey={publicKey}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
} 