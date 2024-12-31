import React from 'react';
import { Box, Typography } from '@mui/material';
import { DuotoneIcon } from '../DuotoneIcon';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Unable to Retrieve Data',
  description = 'The data for this category is currently unavailable',
  icon = 'solar:shield-warning-bold-duotone'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
        textAlign: 'center'
      }}
    >
      <Box sx={{ 
        color: 'text.secondary',
        mb: 2,
        fontSize: 48
      }}>
        <DuotoneIcon 
          icon={icon}
          size="large"
        />
      </Box>
      <Typography 
        variant="h6" 
        color="text.secondary"
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        {description}
      </Typography>
    </Box>
  );
}; 