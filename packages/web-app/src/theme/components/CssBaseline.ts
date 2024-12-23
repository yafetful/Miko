import { Components, Theme } from '@mui/material/styles';

export const CssBaseline: Components<Theme>['MuiCssBaseline'] = {
  styleOverrides: {
    body: {
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,.1)',
        borderRadius: '3px',
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,.2)',
        },
      },
    },
  },
}; 