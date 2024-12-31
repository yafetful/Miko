import React from 'react';
import { Box } from '@mui/material';
import { SummaryCard } from './SummaryCard';
import { OverviewMetricsCard } from './OverviewMetricsCard';
import { SentimentAnalysisCard } from './SentimentAnalysisCard';
import { SentimentDistributionCard } from './SentimentDistributionCard';
import { EngagementMetricsCard } from './EngagementMetricsCard';

interface SentimentPanelProps {
  data: any;
  items: any[];
}

export const SentimentPanel: React.FC<SentimentPanelProps> = ({ data, items }) => {
  const summaryItem = items.find(item => 
    item.content.type === 'summary' && 
    item.content.category === 'sentiment'
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SummaryCard data={summaryItem?.content.data} />
      <OverviewMetricsCard data={data} />
      <SentimentAnalysisCard data={data.types_sentiment} />
      <SentimentDistributionCard data={data.types_sentiment_detail} />
      <EngagementMetricsCard data={data.types_interactions} />
    </Box>
  );
}; 