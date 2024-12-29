import { useMemo, useCallback, useState } from 'react';
import { MessageService } from '../services/message-service';
import { ChatMessage, FormattedContent } from '../types/messages';

export type MessageResult = {
  type: 'formatted' | 'text' | 'buffering';
  content?: any;
};

export function useChat() {
  const messageService = useMemo(() => new MessageService(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }]);
  }, []);

  const updateStreaming = useCallback((content: string) => {
    setStreaming(content);
  }, []);

  const clearStreaming = useCallback(() => {
    setStreaming('');
  }, []);

  const handleStreamMessage = useCallback((content: string) => {
    return messageService.processStreamMessage(content);
  }, [messageService]);

  return {
    messages,
    streaming,
    loading,
    error,
    addMessage,
    updateStreaming,
    clearStreaming,
    setLoading,
    setError,
    handleStreamMessage,
  };
} 