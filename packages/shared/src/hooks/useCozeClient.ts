import { useMemo } from 'react';
import { CozeAPI } from '@coze/api';
import type { AuthConfig } from '../types/auth';

export function useCozeClient(authConfig: AuthConfig) {
  const client = useMemo(() => {
    return new CozeAPI({
      baseURL: authConfig.baseUrl,
      token: authConfig.patToken,
      allowPersonalAccessTokenInBrowser: true
    });
  }, [authConfig.baseUrl, authConfig.patToken]);

  return client;
} 