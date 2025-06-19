import React from 'react';
import { Stack, Typography, CircularProgress, Box } from '@mui/material';
import { Event } from '../services/api';
import { EventCard } from './EventCard';
import { ViewMode } from './ViewToggle';

interface EventListProps {
  events: Event[];
  viewMode: ViewMode;
  loading?: boolean;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  viewMode,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No events found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or search terms
        </Typography>
      </Box>
    );
  }

  if (viewMode === 'list') {
    return (
      <Stack spacing={2}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} viewMode="list" />
        ))}
      </Stack>
    );
  }

  // Grid view
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} viewMode="grid" />
      ))}
    </Box>
  );
};

export default EventList;
