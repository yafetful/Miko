// 基础消息类型
export type BaseMessage = {
  role: 'User' | 'Assistant';
  content: string | FormattedContent | FormattedContent[];
  timestamp: number;
};

// 聊天消息类型
export type ChatMessage = BaseMessage & {
  id: string;
};

// 聊天状态类型
export type ChatState = {
  messages: ChatMessage[];
  streaming?: string | FormattedContent | FormattedContent[];
  loading: boolean;
};

// 格式化内容类型
export type FormattedContent = {
  type: 'summary' | 'analysis' | 'text' | 'msg' | string;
  state: 'success' | 'error' | 'loading';
  category?: 'twitter' | 'tiktok' | 'sentiment' | 'workflow' | string;
  message?: string;
  data: string | Record<string, any>;
};

// 用于判断内容是否为格式化内容
export function isFormattedContent(content: any): content is FormattedContent {
  return content && typeof content === 'object' && 'type' in content;
} 