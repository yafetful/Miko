import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AuthService } from '../services/auth-service';
import type { AuthConfig, AuthState } from '../types/auth';

export function useAuth(authConfig: AuthConfig) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    error: undefined,
  });

  const wallet = useWallet();
  const authService = new AuthService(authConfig);

  useEffect(() => {
    if (!wallet.connected) {
      setAuthState({
        isAuthenticated: false,
        error: undefined,
      });
    }
  }, [wallet.connected]);

  const login = useCallback(async () => {
    try {
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error('Please connect your wallet first');
      }

      const authResult = await authService.authenticate(wallet);
      
      setAuthState({
        isAuthenticated: true,
        publicKey: wallet.publicKey,
        error: undefined,
      });

      return authResult;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [wallet, authService]);

  return {
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    publicKey: authState.publicKey,
    login,
  };
} 