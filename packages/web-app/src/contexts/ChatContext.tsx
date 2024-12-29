import { createContext, useContext, ReactNode } from 'react';
import { useChat as useSharedChat } from 'shared';
import { ChatMessage } from 'shared';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  streaming: string;
}

const ChatContext = createContext<{
  state: ChatState;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateStreaming: (content: string) => void;
  clearStreaming: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handleStreamMessage: (content: string) => any;
} | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const {
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
  } = useSharedChat();

  const value = {
    state: {
      messages,
      streaming,
      loading,
      error
    },
    addMessage,
    updateStreaming,
    clearStreaming,
    setLoading,
    setError,
    handleStreamMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}; 