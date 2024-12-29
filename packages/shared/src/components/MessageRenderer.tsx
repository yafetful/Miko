import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { FormattedContent } from '../types/messages';

// 渲染数据部分的组件
const DataRenderer: React.FC<{ data: any }> = ({ data }) => {
  if (typeof data === 'object') {
    return (
      <Box sx={{ mt: 1 }}>
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {key}:
            </Typography>
            <Box sx={{ pl: 2 }}>
              {typeof value === 'object' ? (
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <Typography>{String(value)}</Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }
  return <Typography>{String(data)}</Typography>;
};

// 主渲染组件
export const MessageRenderer: React.FC<{ content: string | FormattedContent }> = ({ content }) => {
  // 添加调试日志
//   console.log('MessageRenderer received:', content, typeof content);

  if (typeof content === 'string') {
    try {
      // 尝试解析可能是字符串形式的 JSON
      const parsedContent = JSON.parse(content);
      return (
        <Box>
          <Typography variant="h6" color="primary">
            {parsedContent.message}
          </Typography>
          {parsedContent.data && <DataRenderer data={parsedContent.data} />}
        </Box>
      );
    } catch {
      return <Typography>{content}</Typography>;
    }
  }

  // 处理 JSON 格式的消息
  if (content.type === 'msg') {
    return (
      <Box>
        <Typography variant="h6" color="primary">
          {content.message}
        </Typography>
        {content.data && <DataRenderer data={content.data} />}
      </Box>
    );
  }

  // 其他类型的格式化内容
  return <Typography>{JSON.stringify(content, null, 2)}</Typography>;
}; 