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

export interface StreamChatConfig {
  query: string;
  conversationId?: string;
  user_id?: string;
  meta_data?: {
    uuid: string;
  };
  onUpdate: (delta: string) => void;
  onSuccess: (delta: string) => void;
  onCreated: (data: CreateChatData) => void;
}