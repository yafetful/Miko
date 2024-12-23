/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_COZE_APP_ID: string
  readonly REACT_APP_COZE_KEY_ID: string
  readonly REACT_APP_COZE_AUD: string
  readonly REACT_APP_COZE_BOT_ID: string
  readonly REACT_APP_COZE_BASE_URL: string
  readonly REACT_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
