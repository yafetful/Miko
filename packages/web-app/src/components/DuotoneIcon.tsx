import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface DuotoneIconProps {
  icon: string;
  size?: 'small' | 'medium' | 'large';
  primaryColor?: string;
  secondaryOpacity?: number;
  className?: string;
}

const iconSizes = {
  small: '1.25rem',
  medium: '1.5rem',
  large: '2rem',
};

export function DuotoneIcon({
  icon,
  size = 'medium',
  primaryColor,
  secondaryOpacity = 0.3,
  className,
}: DuotoneIconProps) {
  const theme = useTheme();
  
  // 获取主色，优先使用传入的颜色，否则使用当前文本颜色
  const primary = primaryColor || 'currentColor';
  
  // 根据主色和不透明度生成次要颜色
  const secondary = alpha(primary === 'currentColor' 
    ? (theme.palette.mode === 'dark' ? '#fff' : '#000')
    : primary, 
    theme.palette.mode === 'dark' ? secondaryOpacity * 0.8 : secondaryOpacity
  );

  return (
    <Icon
      icon={icon}
      className={className}
      style={{
        width: iconSizes[size],
        height: iconSizes[size],
        '--iconify-primary-color': primary,
        '--iconify-secondary-color': secondary,
      } as React.CSSProperties}
    />
  );
} 