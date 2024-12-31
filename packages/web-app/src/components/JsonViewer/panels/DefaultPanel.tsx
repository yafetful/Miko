import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';

export const DefaultPanel: React.FC<{ item: any }> = ({ item }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={item.content.type}
        sx={{
          '& .MuiCardHeader-title': {
            fontSize: '1rem',
          }
        }}
      />
      <CardContent>
        {item.content.message && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {item.content.message}
          </Typography>
        )}
        {item.content.data && (
          <Box 
            component="pre"
            sx={{
              bgcolor: 'background.default',
              p: 1.5,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              '&::-webkit-scrollbar': {
                height: 8,
                width: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'action.hover',
                borderRadius: 4,
              }
            }}
          >
            {JSON.stringify(item.content.data, null, 2)}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}; 