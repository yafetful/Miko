import React, { useRef } from 'react';
import { MessageRenderer } from './MessageRenderer';
import { MessageAggregator } from '../services/message-aggregator';
import { CoinDataRenderer } from './CoinDataRenderer';

const fixJsonString = (jsonString: string): string => {
  return jsonString
    .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // 修复缺少引号的键
    .replace(/:\s*([a-zA-Z0-9_]+)\s*([,}])/g, ':"$1"$2') // 修复缺少引号的字符串值
    .replace(/([^,{])\s*}/g, '$1,}') // 修复对象末尾缺少逗号
    .replace(/\.\.\."/g, '",') // 修复省略号
    .replace(/\n/g, '') // 移除换行符
    .replace(/,\s*}/g, '}') // 移除对象末尾多余的逗号
    .replace(/,\s*]/g, ']'); // 移除数组末尾多余的逗号
};

export const ContentParser: React.FC<{ content: string | any }> = ({ content }) => {
  // 使用 useRef 来保持实例在组件生命周期内
  const aggregatorRef = useRef<MessageAggregator>(new MessageAggregator());

  // 首先解析内容
  let parsedContent = content;
  if (typeof content === 'string') {
    if (content.trim().startsWith('{')) {
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        try {
          const fixedJson = fixJsonString(content);
          parsedContent = JSON.parse(fixedJson);
        } catch {
          parsedContent = content;
        }
      }
    }
  }

  // 处理消息聚合
  const result = aggregatorRef.current.processMessage(parsedContent);
  
  if (result.shouldAggregate) {
    return null;
  }

  if (result.aggregatedData) {
    return <CoinDataRenderer data={result.aggregatedData} />;
  }

  return <MessageRenderer content={result.message || parsedContent} />;
}; 