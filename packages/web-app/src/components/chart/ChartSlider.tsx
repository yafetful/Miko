import React from 'react';
import { Slider, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSlider = styled(Slider)({
  color: '#999',
  height: 2,
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(158, 158, 158, 0.16)',
    }
  },
  '& .MuiSlider-track': {
    height: 2,
  },
  '& .MuiSlider-rail': {
    height: 2,
    opacity: 0.5,
  },
  '& .MuiSlider-valueLabel': {
    zIndex: 99
  }
});

interface ChartSliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export const ChartSlider: React.FC<ChartSliderProps> = ({ value, max, onChange }) => {
  const handleEvent = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <Box 
      sx={{ 
        width: '200px',
        mx: 2,
        position: 'relative',
        zIndex: 1000
      }}
      onClick={handleEvent}
      onMouseDown={handleEvent}
    >
      <StyledSlider
        value={value}
        min={0}
        max={max}
        onChange={(_, newValue) => onChange(newValue as number)}
      />
    </Box>
  );
}; 