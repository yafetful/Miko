// 定义可能的响应格式
export type ChatContent = string | Array<any> | Record<string, any>;

export interface StreamChatOptions {
  query: string;
  user_id: string;
  conversationId?: string;
  onUpdate: (content: ChatContent) => void;
  onSuccess: (content: ChatContent) => void;
  onCreated: (data: { conversation_id: string }) => void;
}

export interface ChatResponse {
  conversation_id: string;
  content: ChatContent;
} 