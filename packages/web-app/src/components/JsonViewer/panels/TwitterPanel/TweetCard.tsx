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

interface Tweet {
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

interface TweetCardProps {
  tweets: Tweet[];
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweets }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllAvatars, setShowAllAvatars] = useState(false);
  const currentTweet = tweets[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tweets.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tweets.length) % tweets.length);
  };

  const getAvatarSrc = (avatar?: string) => {
    return avatar || DEFAULT_AVATAR;
  };

  if (!tweets?.length) return null;

  return (
    <Card>
      <CardHeader
        title="Top Tweets"
        subheader={
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Trending discussions from influential crypto voices
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
                  {tweets.map((tweet, index) => (
                    <Avatar 
                      key={index}
                      src={tweet.creator_avatar}
                      alt={tweet.creator_display_name}
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
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => setShowAllAvatars(true)}
                >
                  {tweets.map((tweet, index) => (
                    <Avatar 
                      key={index}
                      src={tweet.creator_avatar}
                      alt={tweet.creator_display_name}
                      sx={{ 
                        cursor: 'pointer',
                        opacity: index === currentIndex ? 1 : 0.5,
                        transition: 'opacity 0.2s'
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // 防止触发父元素的onClick
                        setCurrentIndex(index);
                      }}
                    />
                  ))}
                </AvatarGroup>
              )}
              <Typography variant="caption" color="text.secondary">
                {currentIndex + 1} of {tweets.length} tweets
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
              src={getAvatarSrc(currentTweet.creator_avatar)}
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle1" component="div">
                {currentTweet.creator_display_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(currentTweet.post_created * 1000).toLocaleDateString()}
                {' · '}
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {currentTweet.creator_followers.toLocaleString()}
                </Box>
                {' followers'}
              </Typography>
            </Box>
          </Box>
          
          <PostMetrics 
            interactions24h={currentTweet.interactions_24h}
            interactionsTotal={currentTweet.interactions_total}
            sentiment={currentTweet.post_sentiment}
          />
          
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {currentTweet.post_title}
          </Typography>

          {currentTweet.post_image && (
            <Box 
              component="img"
              src={currentTweet.post_image}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2
              }}
            />
          )}
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
          href={currentTweet.post_link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          View on Twitter
          <LaunchIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
        </Link>
      </CardActions>
    </Card>
  );
};
