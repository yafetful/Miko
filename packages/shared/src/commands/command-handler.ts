import { CommandRegistry, MikoCommand } from '../types/commands';

// 预定义的命令
const commands: CommandRegistry = {
  info: {
    name: 'info',
    pattern: /\[mikoCmd:info\]/,
    execute: () => {
      console.log('Executing info command');
      // 实现信息显示逻辑
    },
    description: 'Display system information'
  },
  // 可以添加更多命令
};

export class CommandHandler {
  private static instance: CommandHandler;
  private commands: CommandRegistry = commands;

  private constructor() {}

  public static getInstance(): CommandHandler {
    if (!CommandHandler.instance) {
      CommandHandler.instance = new CommandHandler();
    }
    return CommandHandler.instance;
  }

  // 注册新命令
  public registerCommand(command: MikoCommand): void {
    this.commands[command.name] = command;
  }

  // 检查并执行命令
  public async processMessage(content: string): Promise<boolean> {
    for (const cmd of Object.values(this.commands)) {
      const match = content.match(cmd.pattern);
      if (match) {
        const params = match[1]; // 如果命令包含参数
        await cmd.execute(params);
        return true;
      }
    }
    return false;
  }
} 