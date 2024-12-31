import { useState, useEffect } from 'react';
import { CommandService } from 'shared';
import { useJsonCollector } from '../contexts/JsonCollectorContext';

export function useCommandHandler() {
  const [commandService] = useState(() => new CommandService());
  const { clearCurrentPackage } = useJsonCollector();
  const [isCollecting, setIsCollecting] = useState(false);
  
  useEffect(() => {
    // 注册所有命令
    commandService.register('analyze', {
      execute: async (params) => {
        // 开始收集数据
        setIsCollecting(true);
        clearCurrentPackage();
        
        try {
          console.log('执行 analyze 命令');
          // 执行命令...
        } finally {
          // 命令执行完成后结束收集
          setIsCollecting(false);
        }
      }
    });
    
    // 可以注册更多命令...
  }, [commandService, clearCurrentPackage]);

  return {
    commandService,
    executeCommand: (content: string) => {
      try {
        commandService.execute(content);
      } catch (error) {
        console.error('命令执行失败:', error);
        setIsCollecting(false);
      }
    },
    isCollecting // 导出收集状态
  };
} 