import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChatEventType, ChatStatus, RoleType } from '@coze/api';

interface Message {
  id: string;
  role: 'User' | 'Assistant';
  content: string;
  type?: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  streamingContent: string;
}

type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: Omit<Message, 'id' | 'timestamp'> }
  | { type: 'UPDATE_STREAMING'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_STREAMING' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, {
          ...action.payload,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        }],
        streamingContent: '',
      };
    case 'UPDATE_STREAMING':
      return {
        ...state,
        // streamingContent: state.streamingContent + action.payload,
        streamingContent: action.payload,
      };
    case 'CLEAR_STREAMING':
      return {
        ...state,
        streamingContent: '',
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const ChatContext = createContext<{
  state: ChatState;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateStreaming: (content: string) => void;
  clearStreaming: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
} | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    loading: false,
    error: null,
    streamingContent: '',
  });

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const updateStreaming = (content: string) => {
    dispatch({ type: 'UPDATE_STREAMING', payload: content });
  };

  const clearStreaming = () => {
    dispatch({ type: 'CLEAR_STREAMING' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  return (
    <ChatContext.Provider value={{ 
      state, 
      addMessage, 
      updateStreaming,
      clearStreaming,
      setLoading, 
      setError 
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}; 