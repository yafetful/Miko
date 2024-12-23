// packages/shared/src/index.ts
export * from './services/coze-service';
export * from './services/auth-service';
export * from './types/chat';
export * from './types/auth';
export * from './hooks/useAuth';
export * from './hooks/useCozeClient';

export const sayHello = () => {
  return "Hello from shared package!";
};

export const testAI = async () => {
  return "AI response simulation";
};
