import { darkScrollbar } from '@mui/material';
import { Components, Theme } from '@mui/material/styles';

export const TextField: Components<Theme>['MuiTextField'] = {
  defaultProps: {
    variant: 'outlined',
  },
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: '32px',
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          transition: 'border-color 0.2s ease',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
          borderWidth: '2px',
        },
      },
      '& .MuiInputBase-inputMultiline': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(144, 144, 144, 1) transparent',
      },
    },
  },
}; 