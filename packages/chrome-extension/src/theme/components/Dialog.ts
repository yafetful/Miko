import { Components, Theme } from '@mui/material/styles';

export const Dialog: Components<Theme>['MuiDialog'] = {
  styleOverrides: {
    paper: {
      borderRadius: '16px',
    },
  },
}; 