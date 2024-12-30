// packages/shared/src/types/chat.ts
import {
  BotInfo,
  CreateChatData,
  EnterMessage,
  FileObject,
} from '@coze/api';

export type { BotInfo, CreateChatData, EnterMessage, FileObject };

export interface ChatState {
  messages: string[];
  isLoading: boolean;
  error?: string;
  conversationId?: string;
}

export interface ChatConfig {
  baseUrl: string;
  pat: string;
  botId: string;
}

export interface MessageResult {
  type: 'json' | 'text';
  content: string;
  isComplete: boolean;
  isCommand?: boolean;
}

export interface StreamChatConfig {
  query: string;
  conversationId?: string;
  user_id?: string;
  meta_data?: {
    uuid: string;
  };
  onUpdate: (result: MessageResult) => void;
  onSuccess: (delta: string) => void;
  onCreated: (data: CreateChatData) => void;
}