import React from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useJsonCollector } from '../../contexts/JsonCollectorContext';

interface StatusMessage {
  category: string;
  message: string;
  state: 'success' | 'error';
}

export const LoadingState: React.FC = () => {
  const { getCurrentPackage } = useJsonCollector();
  const currentPackage = getCurrentPackage();
  
  console.log('Current Package:', currentPackage);
  
  const statusMessages: StatusMessage[] = (currentPackage?.data || [])
    .filter(item => {
      console.log('Filtering item:', item);
      return item.content?.type === 'msg' && 
             item.content?.message && 
             item.content?.category;
    })
    .map(item => {
      console.log('Mapping item:', item);
      return {
        category: item.content.category,
        message: item.content.message,
        state: item.content.state
      };
    });

  console.log('Status Messages:', statusMessages);

  // 按类别排序，保持消息顺序一致
  const sortedMessages = statusMessages.sort((a, b) => 
    a.category.localeCompare(b.category)
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 4,
      }}
    >
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3 
      }}>
        <CircularProgress size={32} sx={{ mr: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Collecting data...
        </Typography>
      </Box>

      <Stack spacing={2}>
        {sortedMessages.map((status, index) => (
          <Box
            key={`${status.category}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {status.state === 'success' ? (
              <CheckCircleIcon 
                sx={{ 
                  color: 'success.main',
                  fontSize: 20
                }}
              />
            ) : (
              <CancelIcon 
                sx={{ 
                  color: 'error.main',
                  fontSize: 20
                }}
              />
            )}
            <Typography 
              variant="body2"
              color={status.state === 'success' ? 'text.primary' : 'error'}
            >
              {status.message}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}; 