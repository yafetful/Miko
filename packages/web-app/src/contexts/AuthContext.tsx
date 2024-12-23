import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface AuthState {
  isAuthenticated: boolean;
  signature?: string;
  walletAddress?: string;
  timestamp?: number;
}

const AUTH_STORAGE_KEY = 'auth_state';
const AUTH_EXPIRY_TIME = 24 * 60 * 60 * 1000;

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  publicKey?: PublicKey;
  signIn: () => Promise<void>;
  signOut: () => void;
}>({
  isAuthenticated: false,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false });
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!connected || initialCheckDone.current) return;
    
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) return;

    try {
      const auth: AuthState = JSON.parse(storedAuth);
      const now = Date.now();
      const isExpired = !auth.timestamp || now - auth.timestamp >= AUTH_EXPIRY_TIME;
      const isValidWallet = publicKey && auth.walletAddress === publicKey.toBase58();
      
      if (!isExpired && isValidWallet) {
        setAuthState(auth);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthState({ isAuthenticated: false });
      }
      
      initialCheckDone.current = true;
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState({ isAuthenticated: false });
    }
  }, [publicKey, connected]);

  useEffect(() => {
    if (!connected && authState.isAuthenticated) {
      setAuthState({ isAuthenticated: false });
      localStorage.removeItem(AUTH_STORAGE_KEY);
      initialCheckDone.current = false;
    }
  }, [connected, authState.isAuthenticated]);

  const signIn = async () => {
    if (!publicKey || !signMessage) return;

    try {
      const message = new TextEncoder().encode(
        `Sign in to Chat App\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`
      );
      const signature = await signMessage(message);
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        signature: Buffer.from(signature).toString('base64'),
        walletAddress: publicKey.toBase58(),
        timestamp: Date.now(),
      };

      setAuthState(newAuthState);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
    } catch (error) {
      setAuthState({ isAuthenticated: false });
    }
  };

  const signOut = () => {
    setAuthState({ isAuthenticated: false });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    disconnect?.();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        publicKey: publicKey || undefined,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
}; 