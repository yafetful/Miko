import React from 'react';
import { Box, Card, CardHeader, CardContent, Typography } from '@mui/material';

interface SentimentAnalysisCardProps {
  data?: Record<string, number>;
}

export const SentimentAnalysisCard: React.FC<SentimentAnalysisCardProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const hasNonZeroValue = Object.values(data).some(value => value > 0);
  if (!hasNonZeroValue) return null;

  return (
    <Card>
      <CardHeader 
        title="Overall Sentiment Analysis"
        subheader="Shows how positive or negative the discussions are across different platforms. Higher score means more positive sentiment."
      />
      <CardContent>
        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          width: '100%'
        }}>
          {Object.entries(data).map(([type, score]) => (
            <Box 
              key={type}
              sx={{ 
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '100px',
                flex: '1 1 auto'
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem', mb: 0.5 }}
              >
                {type.toUpperCase()}
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  fontSize: '1.1rem',
                  color: score === 0 || score === null ? 'text.secondary' : 'text.primary'
                }}
              >
                {score === 0 || score === null ? 'No data' : score}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 