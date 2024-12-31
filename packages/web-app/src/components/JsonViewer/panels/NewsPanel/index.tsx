import React from 'react';
import { Box } from '@mui/material';
import { SummaryCard } from '../SentimentPanel/SummaryCard';
import { NewsCard } from './NewsCard';

interface NewsPanelProps {
  data: any[];
  items: any[];
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ data, items }) => {
  const summaryItem = items.find(item => 
    item.content.type === 'summary' && 
    item.content.category === 'news'
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SummaryCard data={summaryItem?.content.data} />
      <NewsCard news={data} />
    </Box>
  );
}; 