import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
import { useJsonCollector } from '../../contexts/JsonCollectorContext';
import { TabPanel } from './TabPanel';
import { SentimentPanel } from './panels/SentimentPanel';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { TwitterPanel } from './panels/TwitterPanel';
import { NewsPanel } from './panels/NewsPanel';

interface JsonViewerContentProps {
  packageId: string;
  onComplete?: () => void;
  isCollecting: boolean;
}

export const JsonViewerContent: React.FC<JsonViewerContentProps> = ({ 
  packageId, 
  onComplete,
  isCollecting 
}) => {
  const { getAllPackages, onJsonUpdate } = useJsonCollector();
  const [activeTab, setActiveTab] = useState<string>('');

  // 获取选中的包数据
  const selectedPackage = getAllPackages().find(pkg => pkg.id === packageId);
  const jsonData = selectedPackage?.data || [];

  // Group data by category
  const groupedData = useMemo(() => {
    const groups: Record<string, typeof jsonData> = {};
    jsonData.forEach(item => {
      const category = item.content.category || 'other';
      if (category === 'workflow') return;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [jsonData]);

  // 修改加载状态的判断
  const isLoading = isCollecting || (selectedPackage && jsonData.length === 0);

  console.log('JsonViewerContent render:', {
    isCollecting,
    packageId,
    jsonDataLength: jsonData.length,
    selectedPackage: !!selectedPackage,
    isLoading
  });

  useEffect(() => {
    if (jsonData.length > 0 && !activeTab && Object.keys(groupedData).length > 0) {
      setActiveTab(Object.keys(groupedData)[0]);
    }
  }, [jsonData.length, activeTab, groupedData]);

  useEffect(() => {
    const unsubscribe = onJsonUpdate((data) => {
      const completionMessage = data.find(item => 
        item.type === 'completion' || 
        item.content?.state === 'complete'
      );
      if (completionMessage) {
        onComplete?.();
      }
    });
    return () => unsubscribe();
  }, [onComplete]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (Object.keys(groupedData).length === 0) {
    return null;
  }

  const isCategoryDataValid = (items: typeof jsonData) => {
    const msgItem = items.find(item => item.content.type === 'msg');
    return !(msgItem && !msgItem.content.data);
  };

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none'
          }
        }}
      >
        {Object.keys(groupedData).map((category) => (
          <Tab 
            key={category} 
            label={category} 
            value={category}
            id={`tab-${category}`}
            aria-controls={`tabpanel-${category}`}
          />
        ))}
      </Tabs>

      {Object.entries(groupedData).map(([category, items]) => (
        <TabPanel key={category} value={activeTab} index={category}>
          {isCategoryDataValid(items) ? (
            items.map((item, index) => {
              if (item.content.type === 'msg') {
                if (category === 'sentiment') {
                  return <SentimentPanel key={index} data={item.content.data} items={items} />;
                }
                if (category === 'twitter') {
                  return <TwitterPanel key={index} data={item.content.data} items={items} />;
                }
                if (category === 'news') {
                  return <NewsPanel key={index} data={item.content.data} items={items} />;
                }
              }
              return null;
            })
          ) : (
            <EmptyState 
              title="Unable to Retrieve Data"
              description="The data for this category is currently unavailable"
              icon="solar:shield-warning-bold-duotone"
            />
          )}
        </TabPanel>
      ))}
    </>
  );
}; 