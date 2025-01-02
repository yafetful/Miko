// 动态导入语言文件
const loadLocaleMessages = async (locale: string) => {
  try {
    const messages = await import(`./locales/${locale}.json`);
    return messages.default;
  } catch (e) {
    console.error(`Could not load locale ${locale}`, e);
    return null;
  }
};

type LanguageChangeListener = (locale: string) => void;

// 添加常量
export const STORAGE_KEY = 'language';

class I18n {
  private messages: Record<string, any> = {};
  private currentLocale: string = 'en';
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private listeners: Set<LanguageChangeListener> = new Set();

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve) => {
      try {
        // 使用相同的 STORAGE_KEY
        const savedLang = localStorage.getItem(STORAGE_KEY);
        let locale = 'en'; // 默认语言

        if (savedLang) {
          try {
            const langData = JSON.parse(savedLang);
            locale = langData.code;
          } catch (e) {
            console.error('Failed to parse saved language:', e);
          }
        } else {
          const browserLang = navigator.language.split('-')[0];
          const supportedLocales = ['en', 'zh', 'ja', 'ko', 'fr', 'es'];
          if (supportedLocales.includes(browserLang)) {
            locale = browserLang;
          }
        }

        // 加载语言包
        const messages = await loadLocaleMessages(locale);
        if (messages) {
          this.messages = messages;
          this.currentLocale = locale;
          this.initialized = true;
        } else {
          // 如果加载失败，回退到英语
          const enMessages = await loadLocaleMessages('en');
          if (enMessages) {
            this.messages = enMessages;
            this.currentLocale = 'en';
            this.initialized = true;
          } else {
            throw new Error('Failed to load default language pack');
          }
        }
        resolve();
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        resolve(); // 即使失败也要resolve，让应用可以继续运行
      }
    });

    return this.initPromise;
  }

  async setLocale(locale: string) {
    try {
      const messages = await loadLocaleMessages(locale);
      if (messages) {
        this.messages = messages;
        this.currentLocale = locale;

        this.notifyListeners(locale);
      }
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);
    }
  }

  t(key: string, params: Record<string, string> = {}): string {
    if (!this.initialized) {
      return key; // 如果还没初始化完成，返回原始 key
    }

    const keys = key.split('.');
    let value: any = this.messages;
    
    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      return key;
    }

    return value.replace(/\{(\w+)\}/g, (_, key) => params[key] || '');
  }

  getCurrentLocale() {
    return this.currentLocale;
  }

  isInitialized() {
    return this.initialized;
  }

  // 添加语言变化监听器
  onLanguageChange(listener: LanguageChangeListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(locale: string) {
    this.listeners.forEach(listener => listener(locale));
  }
}

export const i18n = new I18n();
export const initI18n = () => i18n.init(); 