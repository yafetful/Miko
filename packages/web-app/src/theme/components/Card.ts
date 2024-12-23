import { Components, Theme } from '@mui/material/styles';

export const Card: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: {
      borderRadius: '12px',
      '&.MuiPaper-elevation1': {
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)',
      },
    },
  },
}; 