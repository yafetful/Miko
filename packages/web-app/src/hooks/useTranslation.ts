import { useState, useEffect } from 'react';
import { i18n } from '../i18n/i18n';

export function useTranslation() {
  const [, setLocale] = useState(i18n.getCurrentLocale());

  useEffect(() => {
    const unsubscribe = i18n.onLanguageChange((locale) => {
      setLocale(locale);
    });

    return unsubscribe;
  }, []);

  return {
    t: (key: string, params?: Record<string, string>) => i18n.t(key, params),
    currentLocale: i18n.getCurrentLocale()
  };
} 