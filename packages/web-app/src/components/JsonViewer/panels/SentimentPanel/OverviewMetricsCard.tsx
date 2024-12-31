import React from 'react';
import { Box, Card, CardHeader, CardContent, Typography } from '@mui/material';

interface OverviewMetricsCardProps {
  data?: {
    interactions_1h: number;
    interactions_24h: number;
    num_contributors: number;
    num_posts: number;
  };
}

export const OverviewMetricsCard: React.FC<OverviewMetricsCardProps> = ({ data }) => {
  if (!data) return null;

  const hasNonZeroValue = Object.values(data).some(value => value > 0);
  if (!hasNonZeroValue) return null;

  const metrics = [
    { label: 'Last Hour', value: data.interactions_1h },
    { label: '24h Total', value: data.interactions_24h },
    { label: 'Contributors', value: data.num_contributors },
    { label: 'Total Posts', value: data.num_posts }
  ];

  return (
    <Card>
      <CardHeader title="Overview Metrics" />
      <CardContent>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
          width: '100%'
        }}>
          {metrics.map(({ label, value }) => (
            <Box
              key={label}
              sx={{
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 0.5,
                  fontSize: '1.1rem'
                }}
              >
                {value.toLocaleString()}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 