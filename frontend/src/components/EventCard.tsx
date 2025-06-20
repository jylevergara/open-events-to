import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Stack,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  AttachMoney,
  ExpandMore,
  Comment,
} from '@mui/icons-material';
import { Event } from '../services/api';
import { FavoriteButton } from './FavoriteButton';
import { CommentSection } from './CommentSection';

interface EventCardProps {
  event: Event;
  viewMode?: 'grid' | 'list';
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  viewMode = 'grid' 
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getCategories = () => {
    if (Array.isArray(event.CategoryList)) {
      return event.CategoryList;
    }
    return event.CategoryList ? [event.CategoryList] : [];
  };

  const getDescription = () => {
    if (Array.isArray(event.LongDesc)) {
      return event.LongDesc.join(' ');
    }
    return event.LongDesc || '';
  };

  const isListView = viewMode === 'list';

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: isListView ? 'auto' : '100%',
        display: 'flex',
        flexDirection: isListView ? 'row' : 'column',
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
    >
      {/* Event Image */}
      {event.Image && (
        <CardMedia
          component="img"
          sx={{
            height: isListView ? 120 : 200,
            width: isListView ? 200 : '100%',
            objectFit: 'cover',
          }}
          image={event.Image}
          alt={event.EventName}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ flex: 1, pb: 1 }}>
          {/* Event Title */}
          <Typography variant="h6" component="h2" gutterBottom>
            {event.EventName}
          </Typography>

          {/* Categories */}
          {getCategories().length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
              {getCategories().slice(0, 3).map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              {getCategories().length > 3 && (
                <Chip
                  label={`+${getCategories().length - 3} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          )}

          {/* Event Details */}
          <Stack spacing={1}>
            {event.Area && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.Area}
                </Typography>
              </Box>
            )}

            {event.DateBeginShow && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(event.DateBeginShow)}
                  {event.TimeBegin && ` at ${event.TimeBegin}`}
                </Typography>
              </Box>
            )}

            {event.Admission && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.Admission}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Presenter */}
          {event.PresentedByOrgName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Presented by: {event.PresentedByOrgName}
            </Typography>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FavoriteButton eventId={event.id} />
            <IconButton
              onClick={handleCommentsClick}
              size="small"
              color={showComments ? 'primary' : 'default'}
            >
              <Comment />
            </IconButton>
          </Box>

          {getDescription() && (
            <IconButton
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMore />
            </IconButton>
          )}
        </CardActions>

        {/* Expanded Description */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <CardContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {getDescription()}
            </Typography>
          </CardContent>
        </Collapse>

        {/* Comments Section */}
        <Collapse in={showComments} timeout="auto" unmountOnExit>
          <Divider />
          <CommentSection eventId={event.id} />
        </Collapse>
      </Box>
    </Card>
  );
};

export default EventCard;
