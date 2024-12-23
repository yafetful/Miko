import { Components, Theme } from '@mui/material/styles';

export const Paper: Components<Theme>['MuiPaper'] = {
  defaultProps: {
    elevation: 1,
  },
  styleOverrides: {
    root: {
      borderRadius: '12px',
    },
  },
}; 