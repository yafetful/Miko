// packages/shared/src/types/chat.ts
import type { FileObject } from '@coze/api';

export type ChatConfig = {
  pat: string;
  baseUrl: string;
  botId: string;
};

export type StreamChatConfig = {
  query: string;
  user_id: string;
  conversationId?: string;
  meta_data?: Record<string, any>;
  onUpdate: (content: string) => void;
  onSuccess: (content: string) => void;
  onCreated: (data: any) => void;
};