import { PublicKey } from '@solana/web3.js';

export interface AuthConfig {
  baseUrl: string;
  botId: string;
  patToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  publicKey?: PublicKey;
  error?: string;
} 