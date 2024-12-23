import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Orange, DeepPurple, Gray, Success, Error, Warning, Info } from './colors';
import { typography } from './typography';
import { components } from './components';

const lightThemeOptions: ThemeOptions = {
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: 'light',
    primary: {
      light: Orange[300],
      main: Orange[500],
      dark: Orange[700],
      contrastText: '#fff',
    },
    secondary: {
      light: DeepPurple[300],
      main: DeepPurple[500],
      dark: DeepPurple[700],
      contrastText: '#fff',
    },
    error: Error,
    warning: Warning,
    info: Info,
    success: Success,
    background: {
      default: Gray[200],
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    grey: Gray,
  },
};

const darkThemeOptions: ThemeOptions = {
  ...lightThemeOptions,
  palette: {
    ...lightThemeOptions.palette,
    mode: 'dark',
    primary: {
      light: Orange[200],
      main: Orange[400],
      dark: Orange[600],
      contrastText: '#fff',
    },
    secondary: {
      light: DeepPurple[200],
      main: DeepPurple[400],
      dark: DeepPurple[600],
      contrastText: '#fff',
    },
    background: {
      default: Gray[900],
      paper: '#1e1e1e',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    grey: Gray,
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
