import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { useJsonStorage } from '../hooks/useJsonStorage';

interface JsonData {
  type: string;
  content: any;
  timestamp: number;
}

export interface JsonPackage {
  id: string;
  name: string;
  data: JsonData[];
  timestamp: number;
}

interface JsonCollectorContextType {
  addJson: (data: any) => void;
  getAllJson: () => JsonData[];
  getCurrentPackage: () => JsonPackage | undefined;
  getAllPackages: () => JsonPackage[];
  clearCurrentPackage: () => void;
  deletePackage: (id: string) => void;
  getPackageByName: (name: string) => JsonPackage | undefined;
  isCollecting: boolean;
  setIsCollecting: (value: boolean) => void;
  onJsonUpdate: (callback: (data: JsonData[]) => void) => () => void;
  deletePackageByName: (name: string) => void;
  clearAllPackages: () => void;
}

const JsonCollectorContext = createContext<JsonCollectorContextType | undefined>(undefined);

export function JsonCollectorProvider({ children }: { children: React.ReactNode }) {
  const [isCollecting, setIsCollecting] = useState(false);
  const jsonDataRef = useRef<JsonData[]>([]);
  const packagesRef = useRef<JsonPackage[]>([]);
  const currentPackageIdRef = useRef<string | null>(null);
  const { savePackages, loadPackages, clearPackages, deletePackageByName: deleteStoredPackageByName } = useJsonStorage();
  const callbacksRef = useRef<Set<(data: JsonData[]) => void>>(new Set());

  // 初始化时加载保存的包
  useEffect(() => {
    const savedPackages = loadPackages();
    if (savedPackages.length > 0) {
      packagesRef.current = savedPackages;
    }
  }, [loadPackages]);

  // 当包发生变化时保存
  const saveCurrentPackages = useCallback(() => {
    savePackages(packagesRef.current);
  }, [savePackages]);

  // 修改创建新包的方法
  const createNewPackage = (name?: string) => {
    const newPackage: JsonPackage = {
      id: `package-${Date.now()}`,
      name: name || 'unnamed',
      data: [],
      timestamp: Date.now()
    };

    if (name) {
      const existingPackageIndex = packagesRef.current.findIndex(pkg => pkg.name === name);
      if (existingPackageIndex !== -1) {
        packagesRef.current.splice(existingPackageIndex, 1);
      }
    }

    packagesRef.current.push(newPackage);
    currentPackageIdRef.current = newPackage.id;
    saveCurrentPackages(); // 保存更改
    return newPackage;
  };

  // 获取当前数据包
  const getCurrentPackage = () => {
    if (!currentPackageIdRef.current) {
      return undefined;  // 如果没有当前包，返回 undefined
    }
    return packagesRef.current.find(pkg => pkg.id === currentPackageIdRef.current);
  };

  // 完成当前数据包
  const finalizeCurrentPackage = () => {
    const currentPackage = getCurrentPackage();
    if (currentPackage && jsonDataRef.current.length > 0) {
      currentPackage.data = [...jsonDataRef.current];
      currentPackageIdRef.current = null;
      jsonDataRef.current = [];
      saveCurrentPackages(); // 添加这行来保存更新后的数据
    }
  };

  const addJson = (data: any) => {
    try {
      // 如果是对象，直接处理
      if (typeof data === 'object' && data !== null) {
        handleNormalizedData(data);
        return;
      }

      if (typeof data === 'string') {
        // console.log('Received string data:', data); // 调试日志

        // 检查是否是 workflow 消息
        if (data.includes('"category":"workflow"')) {
          try {
            // 特殊处理 workflow 消息
            const workflowData = {
              type: 'msg',
              category: 'workflow',
              data: data.match(/"data":\s*(\$[^"}]+|#[^"}]+|[^"}]+)/)?.[1] || ''
            };
            handleNormalizedData(workflowData);
            return;
          } catch (e) {
            console.error('Failed to process workflow message:', e, '\nOriginal data:', data);
          }
        }

        // 其他消息的正常处理流程
        try {
          const parsed = JSON.parse(data);
          handleNormalizedData(parsed);
        } catch (e) {
          const cleanedStr = cleanJsonString(data);
          try {
            const parsed = JSON.parse(cleanedStr);
            handleNormalizedData(parsed);
          } catch (e) {
            console.error('Failed to parse cleaned JSON:', e);
            tryExtractPartialJson(cleanedStr);
          }
        }
      }
    } catch (error) {
      console.error('Error in addJson:', error);
    }
  };

  // Try to extract valid partial JSON
  const tryExtractPartialJson = (str: string) => {
    try {
      // Find complete message section
      const messageMatch = str.match(/"message"\s*:\s*"[^"]*"/);
      const typeMatch = str.match(/"type"\s*:\s*"[^"]*"/);
      const stateMatch = str.match(/"state"\s*:\s*"[^"]*"/);
      const categoryMatch = str.match(/"category"\s*:\s*"[^"]*"/);

      if (messageMatch && typeMatch && stateMatch && categoryMatch) {
        // Add data to type definition
        const partialJson: { 
          type: string; 
          state: string; 
          category: string; 
          message: string;
          data?: any;  // Add optional data property
        } = {
          type: JSON.parse(`{${typeMatch[0]}}`).type,
          state: JSON.parse(`{${stateMatch[0]}}`).state,
          category: JSON.parse(`{${categoryMatch[0]}}`).category,
          message: JSON.parse(`{${messageMatch[0]}}`).message
        };

        // Try to extract data section (if exists)
        const dataStart = str.indexOf('"data"');
        if (dataStart !== -1) {
          try {
            let dataStr = str.slice(dataStart);
            // Find complete data object or array
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

  // Extract balanced JSON string
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

  // Clean JSON string
  const cleanJsonString = (str: string): string => {
    let cleaned = str;
    
    // Basic cleaning
    cleaned = cleaned.trim();
    cleaned = cleaned.replace(/^\uFEFF/, '');
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Fix ellipsis and empty data fields
    cleaned = cleaned.replace(/\.{3,}/g, '...');  // Standardize ellipsis format
    cleaned = cleaned.replace(/"data"\s*:\s*\}/, '"data": null}');  // Convert empty data to null
    
    // Fix missing commas
    cleaned = cleaned.replace(/"([^"]+)"\s+"([^"]+)"/g, '"$1","$2"');
    cleaned = cleaned.replace(/"message"\s*:\s*"([^"]*)"\s*"data"/, '"message":"$1","data"');
    
    // Ensure JSON object completeness
    if (!cleaned.endsWith('}')) {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleaned = cleaned.substring(0, lastBrace + 1);
      }
    }
    
    return cleaned;
  };

  // Handle normalized data
  const handleNormalizedData = (data: any) => {
    // 处理 workflow 类型消息
    if (data.category === 'workflow' && data.type === 'msg') {
      // 如果有 data 字段，说明是开始收集
      if (data.data) {
        setIsCollecting(true);  // 开始收集时设置为 true
        const rawName = data.data;
        const packageName = String(rawName).startsWith('$') || String(rawName).startsWith('#')
          ? String(rawName).slice(1)
          : String(rawName);
        createNewPackage(packageName);
        return;
      }
      
      // 如果有 message 字段且值为 'done'，说明完成收集
      if (data.message === 'done') {
        finalizeCurrentPackage();
        setIsCollecting(false);  // 完成收集时设置为 false
        return;
      }
    }

    // 确保有当前包时才添加数据
    if (currentPackageIdRef.current) {
      // console.log('Adding data to package:', data);

      const newData = {
        type: data.type || 'unknown',
        content: data,
        timestamp: Date.now()
      };
      
      jsonDataRef.current.push(newData);
      
      // 实时更新当前包的数据
      const currentPackage = packagesRef.current.find(
        pkg => pkg.id === currentPackageIdRef.current
      );
      if (currentPackage) {
        currentPackage.data = [...jsonDataRef.current];
        // 触发保存以确保数据持久化
        saveCurrentPackages();
      }

      callbacksRef.current.forEach(callback => {
        callback(jsonDataRef.current);
      });
    }
  };

  const onJsonUpdate = (callback: (data: JsonData[]) => void) => {
    callbacksRef.current.add(callback);
    
    return () => {
      callbacksRef.current.delete(callback);
    };
  };

  // Get all collected JSON data
  const getAllJson = () => {
    return jsonDataRef.current;
  };

  // Get all packages
  const getAllPackages = () => {
    return packagesRef.current;
  };

  // Delete a package
  const deletePackage = (id: string) => {
    packagesRef.current = packagesRef.current.filter(pkg => pkg.id !== id);
    if (currentPackageIdRef.current === id) {
      currentPackageIdRef.current = null;
    }
    saveCurrentPackages(); // 保存更改
  };

  // Clear current package
  const clearCurrentPackage = () => {
    if (currentPackageIdRef.current) {
      deletePackage(currentPackageIdRef.current);
    }
    jsonDataRef.current = [];
    setIsCollecting(false);  // 清理当前包时重置状态
  };

  // 获取包的方法也需要支持按名称查找
  const getPackageByName = (name: string) => {
    return packagesRef.current.find(pkg => pkg.name === name);
  };

  // 添加按名称删除包的方法
  const deletePackageByName = (name: string) => {
    const packageToDelete = packagesRef.current.find(pkg => pkg.name === name);
    if (packageToDelete) {
      deletePackage(packageToDelete.id);  // 复用现有的 deletePackage 方法
      deleteStoredPackageByName(name);    // 同时从存储中删除
    }
  };

  // 清除所有包
  const clearAllPackages = () => {
    packagesRef.current = [];
    currentPackageIdRef.current = null;
    jsonDataRef.current = [];
    clearPackages();  // 清除存储
    setIsCollecting(false);  // 清理时重置状态
  };

  return (
    <JsonCollectorContext.Provider 
      value={{
        addJson,
        getAllJson,
        getCurrentPackage,
        getAllPackages,
        clearCurrentPackage,
        deletePackage,
        getPackageByName,
        isCollecting,
        setIsCollecting,
        onJsonUpdate,
        deletePackageByName,
        clearAllPackages,
      }}
    >
      {children}
    </JsonCollectorContext.Provider>
  );
}

// Custom hook for accessing context
export function useJsonCollector() {
  const context = useContext(JsonCollectorContext);
  if (context === undefined) {
    throw new Error('useJsonCollector must be used within a JsonCollectorProvider');
  }
  return context;
} 