import { useState, useRef, useEffect, useCallback } from 'react';
import { chatStorage } from '../utils/chatStorage';
import { Message } from '../components/MessageItem';

export function useChatHistory(walletAddress: string | undefined) {
  const [conversationId, setConversationId] = useState<string>();
  const lastCreatedConversationId = useRef<string>();

  const loadHistoryMessages = useCallback((maxMessages: number = 2): Message[] => {
    if (!walletAddress) return [];

    const history = chatStorage.getHistory(walletAddress);
    if (!history) return [];

    const lastConversation = Object.values(history.conversations)
      .sort((a, b) => b.lastUpdated - a.lastUpdated)[0];

    if (lastConversation) {
      return lastConversation.messages
        .slice(-maxMessages)
        .map(msg => ({
          ...msg,
          timestamp: msg.timestamp || Date.now()
        }));
    }

    return [];
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      const history = chatStorage.getHistory(walletAddress);
      if (history) {
        const sortedConversations = Object.values(history.conversations)
          .sort((a, b) => b.lastUpdated - a.lastUpdated);
        
        if (sortedConversations.length > 0) {
          setConversationId(sortedConversations[0].id);
        }
      }
    }
  }, [walletAddress]);

  const saveMessage = (content: string, role: 'User' | 'Assistant') => {
    const currentConversationId = conversationId || lastCreatedConversationId.current;
    if (currentConversationId && walletAddress) {
      chatStorage.saveMessage(walletAddress, currentConversationId, {
        role,
        content,
        timestamp: Date.now()
      });
    }
  };

  return {
    conversationId,
    setConversationId,
    lastCreatedConversationId,
    saveMessage,
    loadHistoryMessages
  };
} 