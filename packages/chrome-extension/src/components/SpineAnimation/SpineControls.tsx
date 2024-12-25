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
      flexDirection:'row',
      position: 'absolute',
      right: {
        xs: '50%',    // 小屏幕时居中
        sm: '16px'    // 大屏幕时靠右
      },
      transform: {
        xs: 'translateX(60%)',  // 小屏幕时向右移动自身宽度的50%以实现居中
        sm: 'none'              // 大屏幕时不需要位移
      },
      bottom: {
        xs: '-96px',  // 小屏幕时往上移
        sm: '8px'    // 大屏幕时垂直居中
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
        >
          <DuotoneIcon 
            icon={isActive ? 'solar:eye-closed-line-duotone' : 'solar:eye-bold-duotone'}
            size="small"
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
