import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  CircularProgress,
  Drawer,
  IconButton,
  Tabs,
  Tab,
  Fab
} from '@mui/material';
import { useJsonCollector } from '../contexts/JsonCollectorContext';
import { DuotoneIcon } from './DuotoneIcon';

interface JsonViewerProps {
  onComplete?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ flex: 1, overflow: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ onComplete }) => {
  const { getAllJson, onJsonUpdate } = useJsonCollector();
  const [activeTab, setActiveTab] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const jsonData = getAllJson();

  const isCategoryDataValid = (items: typeof jsonData) => {
    const msgItem = items.find(item => item.content.type === 'msg');
    return !(msgItem && !msgItem.content.data);
  };

  // Group data by category
  const groupedData = useMemo(() => {
    const groups: Record<string, typeof jsonData> = {};
    jsonData.forEach(item => {
      const category = item.content.category || 'other';
      // Skip workflow category
      if (category === 'workflow') {
        return;
      }
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [jsonData]);

  // Set initial active tab
  useEffect(() => {
    // Only set active tab if there are non-workflow categories
    if (jsonData.length > 0 && !activeTab && Object.keys(groupedData).length > 0) {
      const firstCategory = Object.keys(groupedData)[0];
      setActiveTab(firstCategory);
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

  // Don't render anything if there are only workflow items
  if (Object.keys(groupedData).length === 0) {
    return null;
  }

  const renderSentimentData = (data: any, items: typeof jsonData) => {
    if (!data) return null;

    const summaryItem = items.find(item => 
      item.content.type === 'summary' && 
      item.content.category === 'sentiment'
    );

    return (
      <>
        {/* 摘要信息 */}
        {summaryItem && (
          <Card sx={{ mb: 2 }}>
            <CardHeader title="Summary" />
            <CardContent>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  color: 'text.primary',
                  '& .highlight': {
                    color: 'primary.main',
                    fontWeight: 500
                  }
                }}
              >
                {summaryItem.content.data}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* 总体指标 */}
        <Card sx={{ mb: 2 }}>
          <CardHeader title="Overview Metrics" />
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'nowrap',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'action.hover',
                borderRadius: 4,
              }
            }}>
              {[
                { label: 'Last Hour', value: data.interactions_1h },
                { label: '24h Total', value: data.interactions_24h },
                { label: 'Contributors', value: data.num_contributors },
                { label: 'Total Posts', value: data.num_posts }
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    textAlign: 'center',
                    minWidth: '140px',
                    flex: '1 0 auto'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 0.5,
                      fontSize: '1.25rem'
                    }}
                  >
                    {(value as number).toLocaleString()}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* 总体情感分析 */}
        <Card sx={{ mb: 2 }}>
          <CardHeader title="Overall Sentiment Analysis" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(data.types_sentiment).map(([type, score]) => (
                <Box 
                  key={type}
                  sx={{ 
                    flex: '1 1 auto',
                    minWidth: '120px',
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {type.toUpperCase()}
                  </Typography>
                  <Typography variant="h6">
                    {String(score)}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* 详细情感分布 */}
        <Card sx={{ mb: 2 }}>
          <CardHeader title="Sentiment Distribution" />
          <CardContent>
            {Object.entries(data.types_sentiment_detail).map(([type, details]) => (
              <Box key={type} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {type.toUpperCase()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {Object.entries(details as Record<string, number>).map(([sentiment, count]) => (
                    <Box 
                      key={sentiment}
                      sx={{ 
                        flex: 1,
                        p: 1,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {sentiment}
                      </Typography>
                      <Typography>
                        {String(count)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* 互动数据 */}
        <Card>
          <CardHeader title="Engagement Metrics" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(data.types_interactions as Record<string, number>).map(([type, count]) => (
                <Box 
                  key={type}
                  sx={{ 
                    flex: '1 1 auto',
                    minWidth: '120px',
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {type.toUpperCase()}
                  </Typography>
                  <Typography variant="h6">
                    {count.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </>
    );
  };

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
            bottom: '80px',
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
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Analysis Results
            </Typography>
            <IconButton size="small" onClick={() => onComplete?.()}>
              <DuotoneIcon icon="solar:close-circle-bold-duotone" />
            </IconButton>
          </Box>

          {/* Loading State */}
          {jsonData.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 2 
            }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography color="text.secondary">
                Collecting data...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Tabs */}
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

              {/* Modified Tab Panels */}
              {Object.entries(groupedData).map(([category, items]) => (
                <TabPanel key={category} value={activeTab} index={category}>
                  {isCategoryDataValid(items) ? (
                    items.map((item, index) => {
                      if (item.content.type === 'msg' && category === 'sentiment') {
                        return renderSentimentData(item.content.data, items);
                      }
                      return (
                        <Card key={index} sx={{ mb: 2 }}>
                          <CardHeader
                            title={item.content.type}
                            sx={{
                              '& .MuiCardHeader-title': {
                                fontSize: '1rem',
                              }
                            }}
                          />
                          <CardContent>
                            {item.content.message && (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {item.content.message}
                              </Typography>
                            )}
                            {item.content.data && (
                              <Box 
                                component="pre"
                                sx={{
                                  bgcolor: 'background.default',
                                  p: 1.5,
                                  borderRadius: 1,
                                  overflow: 'auto',
                                  fontSize: '0.875rem',
                                  '&::-webkit-scrollbar': {
                                    height: 8,
                                    width: 8,
                                  },
                                  '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'action.hover',
                                    borderRadius: 4,
                                  }
                                }}
                              >
                                {JSON.stringify(item.content.data, null, 2)}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    // Invalid data - show error message
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        p: 4,
                      }}
                    >
                      <Box sx={{ 
                        color: 'warning.main',
                        mb: 2,
                        fontSize: 48
                      }}>
                        <DuotoneIcon 
                          icon="solar:shield-warning-bold-duotone" 
                          size="large"
                        />
                      </Box>
                      <Typography 
                        variant="h6" 
                        color="text.secondary"
                        align="center"
                      >
                        Unable to Retrieve Data
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 1 }}
                      >
                        The data for this category is currently unavailable
                      </Typography>
                    </Box>
                  )}
                </TabPanel>
              ))}
            </>
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