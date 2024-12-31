import React from 'react';
import { Box } from '@mui/material';
import { SummaryCard } from '../SentimentPanel/SummaryCard';
import { TweetCard } from './TweetCard';

interface TwitterPanelProps {
  data: any[];
  items: any[];
}

export const TwitterPanel: React.FC<TwitterPanelProps> = ({ data, items }) => {
  const summaryItem = items.find(item => 
    item.content.type === 'summary' && 
    item.content.category === 'twitter'
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SummaryCard data={summaryItem?.content.data} />
      <TweetCard tweets={data} />
    </Box>
  );
}; 