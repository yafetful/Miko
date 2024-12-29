// packages/shared/src/index.ts
// Services
export * from './services/coze-service';
export * from './services/message-service';
export * from './services/auth-service';

// Components
export * from './components/MessageRenderer';
export * from './components/ContentParser';

// Hooks
export * from './hooks/useChat';

// Types
export * from './types/chat';
export * from './types/messages';
export * from './types/auth';

// Theme
export * from './theme/messageStyles';

export const sayHello = () => {
  return "Hello from shared package!";
};

export const testAI = async () => {
  return "AI response simulation";
};
