import React from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';

interface SummaryCardProps {
  data?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <Card>
      <CardContent>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            color: 'text.primary',
            '& .highlight': {
              color: 'primary.main',
              fontWeight: 500
            }
          }}
        >
          {data}
        </Typography>
      </CardContent>
    </Card>
  );
}; 