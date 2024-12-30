import React, { createContext, useContext, useRef, useState } from 'react';

interface JsonData {
  type: string;
  content: any;
  timestamp: number;
}

interface JsonCollectorContextType {
  addJson: (data: any) => void;
  getAllJson: () => JsonData[];
  clearJson: () => void;
  isCollecting: boolean;
  setIsCollecting: (value: boolean) => void;
  onJsonUpdate: (callback: (data: JsonData[]) => void) => () => void;
}

const JsonCollectorContext = createContext<JsonCollectorContextType | undefined>(undefined);

export function JsonCollectorProvider({ children }: { children: React.ReactNode }) {
  const [isCollecting, setIsCollecting] = useState(false);
  const jsonDataRef = useRef<JsonData[]>([]);
  const callbacksRef = useRef<Set<(data: JsonData[]) => void>>(new Set());

  const addJson = (data: any) => {
    try {
      console.log('Received data:', data);
      
      if (typeof data === 'object' && data !== null) {
        handleNormalizedData(data);
        return;
      }

      if (typeof data === 'string') {
        // 尝试直接解析
        try {
          const parsed = JSON.parse(data);
          handleNormalizedData(parsed);
          return;
        } catch (e) {
          // 如果直接解析失败，尝试修复和清理
          const cleanedStr = cleanJsonString(data);
          try {
            const parsed = JSON.parse(cleanedStr);
            handleNormalizedData(parsed);
          } catch (e) {
            console.error('Failed to parse cleaned JSON:', e);
            // 如果还是失败，尝试提取部分有效的 JSON
            tryExtractPartialJson(cleanedStr);
          }
        }
      }
    } catch (error) {
      console.error('Error in addJson:', error);
    }
  };

  // 尝试提取部分有效的 JSON
  const tryExtractPartialJson = (str: string) => {
    try {
      // 查找完整的 message 部分
      const messageMatch = str.match(/"message"\s*:\s*"[^"]*"/);
      const typeMatch = str.match(/"type"\s*:\s*"[^"]*"/);
      const stateMatch = str.match(/"state"\s*:\s*"[^"]*"/);
      const categoryMatch = str.match(/"category"\s*:\s*"[^"]*"/);

      if (messageMatch && typeMatch && stateMatch && categoryMatch) {
        // 添加 data 到类型定义
        const partialJson: { 
          type: string; 
          state: string; 
          category: string; 
          message: string;
          data?: any;  // 添加可选的 data 属性
        } = {
          type: JSON.parse(`{${typeMatch[0]}}`).type,
          state: JSON.parse(`{${stateMatch[0]}}`).state,
          category: JSON.parse(`{${categoryMatch[0]}}`).category,
          message: JSON.parse(`{${messageMatch[0]}}`).message
        };

        // 尝试提取 data 部分（如果存在）
        const dataStart = str.indexOf('"data"');
        if (dataStart !== -1) {
          try {
            let dataStr = str.slice(dataStart);
            // 找到完整的 data 对象或数组
            const extracted = extractBalancedJson(dataStr);
            if (extracted) {
              const dataObj = JSON.parse(`{${extracted}}`);
              partialJson.data = dataObj.data;
            }
          } catch (e) {
            console.log('Could not parse data portion');
          }
        }

        handleNormalizedData(partialJson);
      }
    } catch (e) {
      console.error('Failed to extract partial JSON:', e);
    }
  };

  // 提取平衡的 JSON 字符串
  const extractBalancedJson = (str: string): string | null => {
    let depth = 0;
    let inQuote = false;
    let start = str.indexOf('"data"');
    if (start === -1) return null;

    for (let i = start; i < str.length; i++) {
      const char = str[i];
      
      if (char === '"' && str[i - 1] !== '\\') {
        inQuote = !inQuote;
      }
      
      if (!inQuote) {
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') {
          depth--;
          if (depth === 0) {
            return str.slice(start, i + 1);
          }
        }
      }
    }
    
    return null;
  };

  // 清理 JSON 字符串
  const cleanJsonString = (str: string): string => {
    let cleaned = str;
    
    // 基本清理
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/^\uFEFF/, '');
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // 修复省略号和空的 data 字段
    cleaned = cleaned.replace(/\.{3,}/g, '...');  // 统一省略号格式
    cleaned = cleaned.replace(/"data"\s*:\s*\}/, '"data": null}');  // 空 data 转为 null
    
    // 修复缺少的逗号
    cleaned = cleaned.replace(/"([^"]+)"\s+"([^"]+)"/g, '"$1","$2"');
    cleaned = cleaned.replace(/"message"\s*:\s*"([^"]*)"\s*"data"/, '"message":"$1","data"');
    
    // 确保 JSON 对象的完整性
    if (!cleaned.endsWith('}')) {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleaned = cleaned.substring(0, lastBrace + 1);
      }
    }
    
    return cleaned;
  };

  // 处理规范化后的数据
  const handleNormalizedData = (data: any) => {
    jsonDataRef.current.push({
      type: data.type || 'unknown',
      content: data,
      timestamp: Date.now()
    });
    
    callbacksRef.current.forEach(callback => {
      callback(jsonDataRef.current);
    });
  };

  const onJsonUpdate = (callback: (data: JsonData[]) => void) => {
    callbacksRef.current.add(callback);
    
    return () => {
      callbacksRef.current.delete(callback);
    };
  };

  // 获取所有收集的 JSON 数据
  const getAllJson = () => {
    return jsonDataRef.current;
  };

  // 清空收集的数据
  const clearJson = () => {
    jsonDataRef.current = [];
  };

  return (
    <JsonCollectorContext.Provider 
      value={{
        addJson,
        getAllJson,
        clearJson,
        isCollecting,
        setIsCollecting,
        onJsonUpdate
      }}
    >
      {children}
    </JsonCollectorContext.Provider>
  );
}

// 自定义 hook 用于访问 context
export function useJsonCollector() {
  const context = useContext(JsonCollectorContext);
  if (context === undefined) {
    throw new Error('useJsonCollector must be used within a JsonCollectorProvider');
  }
  return context;
} 