import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Box, Button } from '@mui/material';
import { useAppAuth } from '../contexts/AuthContext';

export function Connect() {
  const { connected } = useWallet();
  const { isAuthenticated, signIn, signOut } = useAppAuth();

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <WalletMultiButton />
      {connected && !isAuthenticated && (
        <Button 
          variant="contained" 
          onClick={signIn}
          color="primary"
        >
          Sign In
        </Button>
      )}
      {isAuthenticated && (
        <Button 
          variant="outlined" 
          onClick={signOut}
          color="primary"
        >
          Sign Out
        </Button>
      )}
    </Box>
  );
} 