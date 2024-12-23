import { WalletContextState } from '@solana/wallet-adapter-react';
import type { AuthConfig, AuthState } from '../types/auth';

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async authenticate(wallet: WalletContextState): Promise<AuthState> {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      throw new Error('Wallet not connected');
    }

    // 简单验证钱包连接状态
    const message = `Login to Chat at ${new Date().toISOString()}`;
    const messageBytes = new TextEncoder().encode(message);
    
    try {
      // 请求签名
      await wallet.signMessage(messageBytes);
      
      // 签名成功即认为认证成功
      return {
        isAuthenticated: true,
        publicKey: wallet.publicKey,
      };
    } catch (error) {
      throw new Error('Failed to sign message');
    }
  }
} 