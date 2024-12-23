import { Components, Theme } from '@mui/material/styles';

export const Tooltip: Components<Theme>['MuiTooltip'] = {
  styleOverrides: {
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      fontSize: '0.75rem',
    },
  },
}; 