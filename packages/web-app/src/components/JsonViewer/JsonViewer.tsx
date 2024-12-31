import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  Typography, 
  Fab,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DuotoneIcon } from '../DuotoneIcon';
import { JsonViewerContent } from './JsonViewerContent';
import { useJsonCollector } from '../../contexts/JsonCollectorContext';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

interface JsonViewerProps {
  onComplete?: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ onComplete }) => {
  const { deletePackage, getAllPackages, getCurrentPackage, isCollecting, clearAllPackages } = useJsonCollector();
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const packages = getAllPackages();
  const currentPackage = getCurrentPackage();
  const hasData = packages.length > 0;

  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      const latestPackage = [...packages].sort((a, b) => b.timestamp - a.timestamp)[0];
      setSelectedPackageId(latestPackage.id);
    }
  }, [packages, selectedPackageId]);

  useEffect(() => {
    if (packages.length > 0 || currentPackage) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [packages.length, currentPackage]);

  useEffect(() => {
    if (isCollecting) {
      setIsExpanded(true);
    }
  }, [isCollecting]);

  const handleDelete = () => {
    if (selectedPackageId) {
      deletePackage(selectedPackageId);
      const remainingPackages = packages.filter(pkg => pkg.id !== selectedPackageId);
      if (remainingPackages.length === 0) {
        setSelectedPackageId('');
        onComplete?.();
      } else {
        const nextPackage = [...remainingPackages].sort((a, b) => b.timestamp - a.timestamp)[0];
        setSelectedPackageId(nextPackage.id);
      }
    }
  };

  const handleClearAll = () => {
    clearAllPackages();
    setSelectedPackageId('');
    onComplete?.();
  };

  console.log('JsonViewer render:', {
    isCollecting,
    hasData,
    packagesLength: packages.length,
    selectedPackageId
  });

  const showLoading = isCollecting && (!hasData || !selectedPackageId);

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={true}
        sx={{
          '& .MuiDrawer-paper': {
            width: isExpanded ? 400 : 0,
            top: '80px',
            bottom: '140px',
            height: 'auto',
            borderRadius: '0 12px 12px 0',
            boxShadow: 3,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: hasData ? 2 : 0
            }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Analysis Results
              </Typography>
              <Box>
                {hasData && (
                  <IconButton 
                    size="small" 
                    onClick={handleClearAll}
                    title="Clear All"
                  >
                    <DuotoneIcon icon="solar:trash-bin-trash-bold-duotone" />
                  </IconButton>
                )}
              </Box>
            </Box>

            {hasData && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select</InputLabel>
                  <Select
                    value={selectedPackageId}
                    label="Select by Token"
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                  >
                    {[...packages]
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((pkg) => (
                        <MenuItem key={pkg.id} value={pkg.id}>
                          {pkg.name} ({new Date(pkg.timestamp).toLocaleTimeString()})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <IconButton 
                  size="small"
                  onClick={handleDelete}
                  title="Delete Selected"
                  sx={{ mt: 0.5 }}
                >
                  <DuotoneIcon icon="solar:eraser-bold-duotone" />
                </IconButton>
              </Box>
            )}
          </Box>

          {showLoading ? (
            <LoadingState />
          ) : hasData ? (
            <JsonViewerContent 
              onComplete={onComplete}
              packageId={selectedPackageId}
              isCollecting={isCollecting}
            />
          ) : (
            <EmptyState />
          )}
        </Box>
      </Drawer>

      <Fab
        size="small"
        sx={{
          position: 'fixed',
          left: isExpanded ? 400 : 0,
          top: '112px',
          transform: 'translateY(-50%)',
          transition: 'left 0.3s ease',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: '0 8px 8px 0',
          boxShadow: 2,
          width: 24,
          height: 48,
          '& .MuiSvgIcon-root': {
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <DuotoneIcon 
          icon="solar:alt-arrow-right-bold-duotone" 
          size="small"
        />
      </Fab>
    </>
  );
}; 