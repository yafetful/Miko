export interface MikoCommand {
  name: string;          // 命令名称
  pattern: RegExp;       // 匹配模式
  execute: (params?: string) => void | Promise<void>;  // 执行函数
  description?: string;  // 命令描述
}

export type CommandRegistry = {
  [key: string]: MikoCommand;
}; 