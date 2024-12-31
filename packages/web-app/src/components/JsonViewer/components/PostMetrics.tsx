import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

interface PostMetricsProps {
  interactions24h: number;
  interactionsTotal: number;
  sentiment: number;
}

export const PostMetrics: React.FC<PostMetricsProps> = ({
  interactions24h,
  interactionsTotal,
  sentiment
}) => {
  const getSentimentIcon = () => {
    if (sentiment >= 3.5) return <SentimentSatisfiedIcon sx={{ color: 'success.main' }} />;
    if (sentiment >= 2.5) return <SentimentNeutralIcon sx={{ color: 'warning.main' }} />;
    return <SentimentVeryDissatisfiedIcon sx={{ color: 'error.main' }} />;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 3,
        mt: 2,
        mb: 1,
        alignItems: 'center'
      }}
    >
      <Tooltip title="24h Interactions">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUpIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            {interactions24h.toLocaleString()}
          </Typography>
        </Box>
      </Tooltip>

      <Tooltip title="Total Interactions">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ShowChartIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            {interactionsTotal.toLocaleString()}
          </Typography>
        </Box>
      </Tooltip>

      <Tooltip title={`Sentiment Score: ${sentiment}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getSentimentIcon()}
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            {sentiment.toFixed(2)}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}; 