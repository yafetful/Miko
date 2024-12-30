import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useChat } from '../contexts/ChatContext';
import { useAppAuth } from '../contexts/AuthContext';
import { MessageItem, Message } from './MessageItem';
import { useChatHistory } from '../hooks/useChatHistory';
import { useJsonCollector } from '../contexts/JsonCollectorContext';

const MAX_VISIBLE_MESSAGES = 2;

export function ChatMessages() {
  const { state } = useChat();
  const { publicKey } = useAppAuth();
  const walletAddress = publicKey?.toBase58();
  const { loadHistoryMessages } = useChatHistory(walletAddress);
  const { onJsonUpdate } = useJsonCollector();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMovingUp, setIsMovingUp] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const streamingMessageRef = useRef<Message | null>(null);
  const streamingTimestampRef = useRef<number>(0);

  // 加载历史记录
  useEffect(() => {
    if (!walletAddress || state.messages.length > 0) return;
    
    const historyMessages = loadHistoryMessages(MAX_VISIBLE_MESSAGES);
    if (historyMessages.length > 0) {
      setMessages(historyMessages);
    }
  }, [walletAddress, state.messages.length]);

  // 处理流式内容
  useEffect(() => {
    if (!state.streamingContent) return;

    const handleStreamingContent = () => {
      if (!streamingMessageRef.current) {
        if (!streamingTimestampRef.current) {
          streamingTimestampRef.current = Date.now();
        }
        
        const newMessage: Message = {
          role: 'Assistant',
          content: state.streamingContent,
          timestamp: streamingTimestampRef.current
        };
        streamingMessageRef.current = newMessage;
        setMessages(prev => [...prev, newMessage].slice(-MAX_VISIBLE_MESSAGES));
      } else {
        const updatedMessage: Message = {
          ...streamingMessageRef.current,
          content: state.streamingContent
        };
        streamingMessageRef.current = updatedMessage;
        setMessages(prev => [...prev.slice(0, -1), updatedMessage].slice(-MAX_VISIBLE_MESSAGES));
      }
    };

    handleStreamingContent();
  }, [state.streamingContent]);

  // 处理新消息
  useEffect(() => {
    if (state.messages.length === 0) return;

    const handleNewMessage = () => {
      const latestMessage = state.messages[state.messages.length - 1];
      
      if (latestMessage.role === 'User') {
        handleUserMessage(latestMessage);
      } else {
        handleAssistantMessage(latestMessage);
      }
    };

    handleNewMessage();
  }, [state.messages.length]);

  // 处理用户消息
  const handleUserMessage = (message: Message) => {
    const newMessage = { ...message, timestamp: Date.now() };

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
  };

  // 处理助手消息
  const handleAssistantMessage = (message: Message) => {
    if (streamingMessageRef.current) {
      const newMessage = {
        ...message,
        timestamp: streamingTimestampRef.current
      };
      setMessages(prev => [...prev.slice(0, -1), newMessage].slice(-MAX_VISIBLE_MESSAGES));
      streamingMessageRef.current = null;
      streamingTimestampRef.current = 0;
    } else {
      const newMessage = { ...message, timestamp: Date.now() };
      setMessages(prev => [...prev, newMessage].slice(-MAX_VISIBLE_MESSAGES));
    }
  };

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // 订阅 JSON 数据更新
    const unsubscribe = onJsonUpdate((jsonData) => {
      console.log('JSON data updated:', jsonData);
    });
    
    // 清理订阅
    return () => unsubscribe();
  }, []);

  if (messages.length === 0) return null;

  return (
    <Box sx={{ 
      flex: 1, 
      overflow: 'auto',
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {messages.map((message, index) => (
        <MessageItem
          key={`${message.role}-${message.timestamp}`}
          message={message}
          isMovingUp={isMovingUp && index < messages.length - 1}
          isEntering={isEntering && index === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
} 