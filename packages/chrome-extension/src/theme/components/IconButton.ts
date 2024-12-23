import { Components, Theme } from '@mui/material/styles';

export const IconButton: Components<Theme>['MuiIconButton'] = {
  defaultProps: {
    color: 'primary',
    size: 'medium',
  },
  variants: [
    {
      props: { color: 'primary' },
      style: ({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.05)',
        color: theme.palette.primary.main,
        transition: theme.transitions.create([
          'background-color',
          'box-shadow',
          'color',
          'transform',
        ], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)',
          transform: 'scale(1.05)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }),
    },
    // ... 其他 variants
  ],
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: '32px',
      '&.Mui-disabled': {
        color: theme.palette.text.disabled,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(0, 0, 0, 0.02)',
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
    }),
  },
}; 