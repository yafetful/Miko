import { useState, useEffect } from 'react';
import { CommandService } from 'shared';

export function useCommandHandler() {
  const [commandService] = useState(() => new CommandService());
  
  useEffect(() => {
    // 注册所有命令
    commandService.register('analyze', {
      execute: async (params) => {
        console.log('执行 analyze 命令');
      }
    });
    
    // 可以注册更多命令...
  }, [commandService]);

  return {
    commandService,
    executeCommand: (content: string) => {
      try {
        commandService.execute(content);
      } catch (error) {
        console.error('命令执行失败:', error);
      }
    }
  };
} 