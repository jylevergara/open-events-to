import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Language,
  Business,
} from '@mui/icons-material';
import { Event, eventService } from '../services/api';
import { FavoriteButton } from './FavoriteButton';
import { CommentSection } from './CommentSection';
import { CalendarExportButton } from './CalendarExportButton';

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setError('Event ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const eventData = await eventService.getEvent(parseInt(id));
        setEvent(eventData);
        setError(null);
      } catch (err) {
        setError('Failed to load event details');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleVisitWebsite = () => {
    if (event?.Website) {
      window.open(event.Website, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    // Handle various time formats
    try {
      const time = new Date(`1970-01-01T${timeStr}`);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  const getCategories = () => {
    if (!event) return [];
    if (Array.isArray(event.CategoryList)) {
      return event.CategoryList;
    }
    return event.CategoryList ? [event.CategoryList] : [];
  };

  const getDescription = () => {
    if (!event) return '';
    if (Array.isArray(event.LongDesc)) {
      return event.LongDesc.join(' ');
    }
    return event.LongDesc || '';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading event details...
        </Typography>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Event not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{ mr: 2 }}
          size="large"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ display: 'inline', fontWeight: 600 }}>
          Event Details
        </Typography>
      </Box>

      <Card elevation={3}>
        {/* Event Image */}
        {event.Image && (
          <CardMedia
            component="img"
            sx={{
              height: 400,
              objectFit: 'cover',
            }}
            image={event.Image}
            alt={event.EventName}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <CardContent sx={{ p: 4 }}>
          {/* Event Title */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600, flex: 1 }}>
              {event.EventName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FavoriteButton eventId={event.id} size="large" />
              <CalendarExportButton event={event} size="large" />
            </Box>
          </Box>

          {/* Categories */}
          {getCategories().length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap">
              {getCategories().map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  color="primary"
                  variant="filled"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          )}

          {/* Event Details Grid */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Event Information
            </Typography>
            
            <Stack spacing={3}>
              {/* Date and Time */}
              {event.DateBeginShow && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CalendarToday color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Date & Time
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {formatDate(event.DateBeginShow)}
                      {event.TimeBegin && (
                        <>
                          <br />
                          {formatTime(event.TimeBegin)}
                          {event.TimeEnd && ` - ${formatTime(event.TimeEnd)}`}
                        </>
                      )}
                      {event.DateEndShow && event.DateEndShow !== event.DateBeginShow && (
                        <>
                          <br />
                          End: {formatDate(event.DateEndShow)}
                        </>
                      )}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Location */}
              {event.Area && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOn color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {event.Area}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Admission */}
              {event.Admission && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <AttachMoney color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Admission
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {event.Admission}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Presenter */}
              {event.PresentedByOrgName && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Business color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Presented By
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {event.PresentedByOrgName}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Description */}
          {getDescription() && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                About This Event
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {getDescription()}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {event.Website && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Language />}
                onClick={handleVisitWebsite}
                sx={{ minWidth: 200 }}
              >
                Visit Event Website
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={handleBack}
            >
              Back to Events
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Comments Section */}
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Comments & Discussion
            </Typography>
            <CommentSection eventId={event.id} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EventDetails;
