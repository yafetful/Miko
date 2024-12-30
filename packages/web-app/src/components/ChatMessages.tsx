import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useChat } from '../contexts/ChatContext';
import { useAppAuth } from '../contexts/AuthContext';
import { chatStorage } from '../utils/chatStorage';
import { MessageItem, Message } from './MessageItem';

const MAX_VISIBLE_MESSAGES = 2;

export function ChatMessages() {
  const { state } = useChat();
  const { publicKey } = useAppAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMovingUp, setIsMovingUp] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const streamingMessageRef = useRef<Message | null>(null);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      const walletAddress = publicKey?.toBase58();
      if (!walletAddress || state.messages.length > 0) return;

      const history = chatStorage.getHistory(walletAddress);
      if (!history) return;

      const lastConversation = Object.values(history.conversations)
        .sort((a, b) => b.lastUpdated - a.lastUpdated)[0];

      if (lastConversation) {
        const historyMessages = lastConversation.messages
          .slice(-MAX_VISIBLE_MESSAGES)
          .map(msg => ({
            ...msg,
            timestamp: msg.timestamp || Date.now()
          }));
        setMessages(historyMessages);
      }
    };

    loadHistory();
  }, [publicKey]);

  // 处理流式内容
  useEffect(() => {
    if (!state.streamingContent) return;

    const handleStreamingContent = () => {
      if (!streamingMessageRef.current) {
        const newMessage: Message = {
          role: 'Assistant',
          content: state.streamingContent,
          timestamp: Date.now()
        };
        streamingMessageRef.current = newMessage;
        setMessages(prev => [...prev, newMessage]);
      } else {
        const updatedMessage: Message = {
          ...streamingMessageRef.current,
          content: state.streamingContent
        };
        streamingMessageRef.current = updatedMessage;
        setMessages(prev => [...prev.slice(0, -1), updatedMessage]);
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
        timestamp: streamingMessageRef.current.timestamp
      };
      setMessages(prev => [...prev.slice(0, -1), newMessage].slice(-MAX_VISIBLE_MESSAGES));
    } else {
      const newMessage = { ...message, timestamp: Date.now() };
      setMessages(prev => [...prev, newMessage].slice(-MAX_VISIBLE_MESSAGES));
    }
  };

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          key={message.timestamp}
          message={message}
          isMovingUp={isMovingUp && index < messages.length - 1}
          isEntering={isEntering && index === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
} 