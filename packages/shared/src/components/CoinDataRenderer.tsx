import React from 'react';
import { Box, Typography } from '@mui/material';

type CoinDataProps = {
  data: {
    coin: string;
    messages: any[];
    isComplete: boolean;
  };
};

export const CoinDataRenderer: React.FC<CoinDataProps> = ({ data }) => {
  // 临时渲染，后续我们会实现完整的表格
  return (
    <Box>
      <Typography variant="h6">{data.coin}</Typography>
      <pre>{JSON.stringify(data.messages, null, 2)}</pre>
    </Box>
  );
}; 