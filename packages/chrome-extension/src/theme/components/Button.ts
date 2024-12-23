import { Components, Theme } from '@mui/material/styles';

export const Button: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: {
      textTransform: 'none',
      borderRadius: '8px',
      padding: '6px 16px',
      '&.MuiButton-containedPrimary:hover': {
        boxShadow: '0 8px 16px 0 rgba(255, 152, 0, 0.3)',
      },
    },
  },
  defaultProps: {
    disableElevation: true,
  },
}; 