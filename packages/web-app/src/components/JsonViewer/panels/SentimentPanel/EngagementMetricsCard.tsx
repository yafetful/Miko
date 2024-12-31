import React from 'react';
import { Box, Card, CardHeader, CardContent, Typography } from '@mui/material';

interface EngagementMetricsCardProps {
  data?: Record<string, number>;
}

export const EngagementMetricsCard: React.FC<EngagementMetricsCardProps> = ({ data }) => {
  if (!data) return null;

  // 过滤掉值为 null 的数据
  const validData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== null)
  );

  // 如果没有有效数据，返回 null
  if (Object.keys(validData).length === 0) return null;

  // 检查是否所有值都为0
  const hasNonZeroValue = Object.values(validData).some(count => count > 0);
  if (!hasNonZeroValue) return null;

  return (
    <Card>
      <CardHeader 
        title="Engagement Metrics"
        subheader="Total interactions (likes, shares, comments, etc.) from each platform in the last 24 hours"
      />
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1.5,
          maxWidth: '600px'
        }}>
          {Object.entries(validData).map(([type, count]) => (
            <Box 
              key={type}
              sx={{ 
                flex: '1 1 auto',
                minWidth: '100px',
                maxWidth: '180px',
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  fontSize: '0.7rem',
                  mb: 0.5,
                  display: 'block'
                }}
              >
                {type.toUpperCase()}
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  fontSize: '1.1rem',
                  color: count === 0 ? 'text.secondary' : 'text.primary'
                }}
              >
                {count === 0 ? 'n/a' : count.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 