import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DuotoneIcon } from '../DuotoneIcon';

interface SpineControlsProps {
  isActive: boolean;
  isSoundEnabled: boolean;
  currentCharacterSet: string;
  onToggleCharacter: () => void;
  onToggleSound: () => void;
  onToggleActive: () => void;
}

export const SpineControls: React.FC<SpineControlsProps> = ({
  isActive,
  isSoundEnabled,
  currentCharacterSet,
  onToggleCharacter,
  onToggleSound,
  onToggleActive,
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      gap: 1,
      flexDirection: {
        xs: 'column',  // 小屏幕时垂直排列
        sm: 'row'      // 大屏幕时水平排列
      },
      position: 'absolute',
      right: {
        xs: '8px',    // 小屏幕时靠右
        sm: '16px'    // 大屏幕时靠右多一点
      },
      top: {
        xs: '-48px',  // 小屏幕时往上移
        sm: '50%'     // 大屏幕时垂直居中
      },
      transform: {
        xs: 'none',
        sm: 'translateY(-50%)'
      }
    }}>
      {isActive && (
        <>
          <Tooltip title={`Switch to ${currentCharacterSet === 'pengu' ? 'Capybara' : 'Pengu'}`}>
            <IconButton
              onClick={onToggleCharacter}
              size="small"
              color="primary"
            >
              <DuotoneIcon 
                icon="solar:ghost-bold-duotone"
                size="small"
              />
            </IconButton>
          </Tooltip>

          <Tooltip title={`${isSoundEnabled ? 'Mute' : 'Turn On'}`}>
            <IconButton
              onClick={onToggleSound}
              size="small"
              color={isSoundEnabled ? 'primary' : 'default'}
            >
              <DuotoneIcon 
                icon={isSoundEnabled ? 'solar:volume-loud-bold-duotone' : 'solar:volume-cross-bold-duotone'}
                size="small"
              />
            </IconButton>
          </Tooltip>
        </>
      )}
      
      <Tooltip title={`${isActive ? 'Hide' : 'Show'}`}>
        <IconButton
          onClick={onToggleActive}
          size="small"
          color={isActive ? 'primary' : 'default'}
        >
          <DuotoneIcon 
            icon="solar:cat-bold-duotone"
            size="small"
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
