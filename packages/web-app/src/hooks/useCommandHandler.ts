import { useState, useEffect } from 'react';
import { CommandService } from 'shared';
import { useJsonCollector } from '../contexts/JsonCollectorContext';

export function useCommandHandler() {
  const [commandService] = useState(() => new CommandService());
  const { clearJson } = useJsonCollector();
  
  useEffect(() => {
    // 注册所有命令
    commandService.register('analyze', {
      execute: async (params) => {
        // 执行命令前清空收集器
        clearJson();
        console.log('执行 analyze 命令');
      }
    });
    
    // 可以注册更多命令...
  }, [commandService, clearJson]);

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