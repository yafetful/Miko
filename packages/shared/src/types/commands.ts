export interface Command {
  type: string;
  params?: Record<string, any>;
}

export interface CommandHandler {
  execute: (params?: Record<string, any>) => void | Promise<void>;
}

export interface CommandRegistry {
  [key: string]: CommandHandler;
}

// 添加命令格式常量
export const COMMAND_PREFIX = 'mikoCmd'; 