import { css } from '@emotion/react';

export const globalStyles = css`
  * {
    scrollbarWidth: thin;
    scrollbarColor: rgba(128, 128, 128, 0.3) transparent;
  }

  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 8px;
  }

  *::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.3);
    border-radius: 8px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 1);
  }
`; 