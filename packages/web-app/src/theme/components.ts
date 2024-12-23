import { Components, Theme } from '@mui/material/styles';
import { CssBaseline } from './components/CssBaseline';
import { Button } from './components/Button';
import { TextField } from './components/TextField';
import { Paper } from './components/Paper';
import { Card } from './components/Card';
import { Dialog } from './components/Dialog';
import { IconButton } from './components/IconButton';
import { Tooltip } from './components/Tooltip';
import { Chip } from './components/Chip';

export const components: Components<Theme> = {
  MuiCssBaseline: CssBaseline,
  MuiButton: Button,
  MuiTextField: TextField,
  MuiPaper: Paper,
  MuiCard: Card,
  MuiDialog: Dialog,
  MuiIconButton: IconButton,
  MuiTooltip: Tooltip,
  MuiChip: Chip,
}; 