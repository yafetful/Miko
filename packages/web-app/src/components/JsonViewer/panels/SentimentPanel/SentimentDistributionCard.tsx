import React from 'react';
import { Box, Card, CardHeader, CardContent, Typography } from '@mui/material';

interface SentimentDistributionCardProps {
  data?: Record<string, Record<string, number>>;
}

export const SentimentDistributionCard: React.FC<SentimentDistributionCardProps> = ({ data }) => {
  if (!data) return null;

  // 过滤掉值为 null 的平台数据
  const validData = Object.fromEntries(
    Object.entries(data).filter(([_, details]) => details !== null)
  );

  // 如果没有有效数据，返回 null
  if (Object.keys(validData).length === 0) return null;

  // 检查是否所有的计数都为0
  const hasNonZeroValue = Object.values(validData).some(details => 
    Object.values(details).some(count => count > 0)
  );
  if (!hasNonZeroValue) return null;

  const sentimentColors = {
    positive: 'rgba(76, 175, 80, 0.1)', // 浅绿色
    neutral: 'rgba(158, 158, 158, 0.1)', // 浅灰色
    negative: 'rgba(244, 67, 54, 0.1)' // 浅红色
  };

  const calculateWidth = (count: number, total: number) => {
    if (total === 0) return '33.33%';
    
    // 最小宽度为15%
    const minWidth = 24;
    // 可分配的剩余宽度百分比（100% - 所有最小宽度）
    const remainingWidth = 100 - (minWidth * 3);
    
    if (count === 0) return `${minWidth}%`;
    
    // 计算这个数据块应该占用的剩余宽度的比例
    const percentage = (count / total) * remainingWidth;
    return `${minWidth + percentage}%`;
  };

  return (
    <Card>
      <CardHeader title="Sentiment Distribution" />
      <CardContent>
        {Object.entries(validData).map(([type, details]) => {
          const total = Object.values(details).reduce((sum, count) => sum + count, 0);

          return (
            <Box key={type} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {type.toUpperCase()}
              </Typography>
              <Box sx={{ 
                display: 'flex',
                gap: 1.5,
                width: '100%',
                maxWidth: '380px'
              }}>
                {Object.entries(details).map(([sentiment, count]) => (
                  <Box 
                    key={sentiment}
                    sx={{ 
                      p: 1,
                      bgcolor: sentimentColors[sentiment as keyof typeof sentimentColors],
                      borderRadius: 1,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: calculateWidth(count, total),
                      minWidth: '60px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.7rem',
                        mb: 0.5,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {sentiment.toUpperCase()}
                    </Typography>
                    <Typography
                      sx={{ 
                        color: count === 0 ? 'text.secondary' : 'text.primary',
                        fontSize: '0.9rem'
                      }}
                    >
                      {count === 0 ? 'n/a' : count.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}; 