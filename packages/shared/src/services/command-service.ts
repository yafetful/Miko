import { Command, CommandHandler, CommandRegistry, COMMAND_PREFIX } from '../types/commands';

export class CommandService {
  private registry: CommandRegistry = {};

  // 注册命令处理器
  register(type: string, handler: CommandHandler) {
    this.registry[type] = handler;
  }

  // 从命令内容中解析出命令类型
  parseCommand(content: string): string | null {
    const cmdRegex = /^\[mikoCmd:(.*?)\]$/;
    const match = content.match(cmdRegex);
    return match ? match[1] : null;
  }

  // 执行命令
  async execute(content: string) {
    const commandType = this.parseCommand(content);
    if (!commandType) {
      throw new Error(`无效的命令格式: ${content}`);
    }

    const handler = this.registry[commandType];
    if (!handler) {
      throw new Error(`未找到命令处理器: ${commandType}`);
    }
    
    await handler.execute({});  // 如果需要参数可以从content中解析
  }
} 