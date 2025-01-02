import { Components, Theme } from '@mui/material/styles';

export const Button: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      textTransform: 'none',
      borderRadius: '8px',
      padding: '6px 16px',
      fontSize: '1.1rem',
      '&.MuiButton-containedPrimary:hover': {
        boxShadow: '0 8px 16px 0 rgba(255, 152, 0, 0.3)',
      },
    }),
    contained: ({ theme }) => ({
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.text.primary,
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    }),
    containedSuccess: ({ theme }) => ({
      backgroundColor: theme.palette.success.main,
      color: '#fff',
      '&:hover': {
        backgroundColor: theme.palette.success.dark,
        boxShadow: '0 8px 16px 0 rgba(76, 175, 80, 0.3)',
      },
    }),
  },
  defaultProps: {
    disableElevation: true,
  },
}; 