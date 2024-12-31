import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  AvatarGroup,
  Typography,
  Box,
  Link,
  IconButton
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { PostMetrics } from '../../components/PostMetrics';
import { DEFAULT_AVATAR } from '../../constants';

interface News {
  creator_avatar: string;
  creator_display_name: string;
  creator_followers: number;
  post_title: string;
  post_image?: string;
  post_link: string;
  post_created: number;
  interactions_24h: number;
  interactions_total: number;
  post_sentiment: number;
}

interface NewsCardProps {
  news: News[];
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllAvatars, setShowAllAvatars] = useState(false);
  const currentNews = news[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const getAvatarSrc = (avatar?: string) => {
    return avatar || DEFAULT_AVATAR;
  };

  if (!news.length) return null;

  return (
    <Card>
      <CardHeader
        title="Top News"
        subheader={
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Latest coverage from major crypto media outlets
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {showAllAvatars ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 1
                  }}
                >
                  {news.map((item, index) => (
                    <Avatar 
                      key={index}
                      src={getAvatarSrc(item.creator_avatar)}
                      alt={item.creator_display_name || 'Unknown'}
                      variant="rounded"
                      sx={{ 
                        cursor: 'pointer',
                        opacity: index === currentIndex ? 1 : 0.5,
                        transition: 'opacity 0.2s',
                        width: 32,
                        height: 32
                      }}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                  <Typography
                    variant="caption"
                    sx={{ 
                      cursor: 'pointer',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => setShowAllAvatars(false)}
                  >
                    Show less
                  </Typography>
                </Box>
              ) : (
                <AvatarGroup 
                  max={5} 
                  sx={{ 
                    mr: 2,
                    '& .MuiAvatarGroup-avatar': {
                      cursor: 'pointer',
                      borderRadius: 1
                    }
                  }}
                  onClick={() => setShowAllAvatars(true)}
                >
                  {news.map((item, index) => (
                    <Avatar 
                      key={index}
                      src={getAvatarSrc(item.creator_avatar)}
                      alt={item.creator_display_name || 'Unknown'}
                      variant="rounded"
                      sx={{ 
                        cursor: 'pointer',
                        opacity: index === currentIndex ? 1 : 0.5,
                        transition: 'opacity 0.2s'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                    />
                  ))}
                </AvatarGroup>
              )}
              <Typography variant="caption" color="text.secondary">
                {currentIndex + 1} of {news.length} articles
              </Typography>
            </Box>
          </Box>
        }
      />
      <CardContent>
        <Box 
          sx={{ 
            borderTop: 1, 
            borderColor: 'divider',
            pt: 2,
            mt: 1 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              src={getAvatarSrc(currentNews?.creator_avatar)}
              variant="rounded"
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" component="div">
                {currentNews?.creator_display_name || 'Unknown Author'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentNews?.post_created ? new Date(currentNews.post_created * 1000).toLocaleDateString() : 'Unknown date'}
                {' · '}
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {(currentNews?.creator_followers || 0).toLocaleString()}
                </Box>
                {' followers'}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {currentNews?.post_title || 'No title available'}
          </Typography>

          {currentNews?.post_image && (
            <Box 
              component="img"
              src={currentNews.post_image}
              alt={currentNews.post_title}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <PostMetrics 
            interactions24h={currentNews?.interactions_24h || 0}
            interactionsTotal={currentNews?.interactions_total || 0}
            sentiment={currentNews?.post_sentiment || 0}
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box>
          <IconButton onClick={handlePrev}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={handleNext}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
        <Link 
          href={currentNews.post_link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          Read full article
          <LaunchIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
        </Link>
      </CardActions>
    </Card>
  );
}; 