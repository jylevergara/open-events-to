import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { LocationOn, Schedule, AttachMoney } from '@mui/icons-material';
import L from 'leaflet';
import { Event } from '../services/api';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EventMapProps {
  events: Event[];
}

// Helper component to fit map bounds to markers
const FitBounds: React.FC<{ events: Event[] }> = ({ events }) => {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;

    const validEvents = events.filter(event => event.coordinates);
    if (validEvents.length === 0) return;

    if (validEvents.length === 1) {
      // If only one event, center on it
      const event = validEvents[0];
      map.setView([event.coordinates!.lat, event.coordinates!.lng], 13);
    } else {
      // If multiple events, fit bounds to include all
      const bounds = L.latLngBounds(
        validEvents.map(event => [event.coordinates!.lat, event.coordinates!.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [events, map]);

  return null;
};

// Create custom colored markers based on event date
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 6px;
          left: 6px;
        "></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });
};

export const EventMap: React.FC<EventMapProps> = ({ events }) => {
  const validEvents = events.filter(event => event.coordinates);

  // Calculate color based on event date
  const getEventColor = (event: Event): string => {
    if (!event.DateBeginShow) return '#9e9e9e'; // Gray for unknown dates

    try {
      const eventDate = new Date(event.DateBeginShow);
      const now = new Date();
      const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 0) return '#9e9e9e'; // Gray for past events
      if (daysDiff <= 7) return '#ff5722'; // Orange for events within a week
      if (daysDiff <= 30) return '#ff9800'; // Orange for events within a month
      return '#4caf50'; // Green for events further out
    } catch {
      return '#9e9e9e'; // Gray for invalid dates
    }
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

  const getCategories = (event: Event) => {
    if (Array.isArray(event.CategoryList)) {
      return event.CategoryList;
    }
    return event.CategoryList ? [event.CategoryList] : [];
  };

  // Default center (Toronto City Hall)
  const defaultCenter: [number, number] = [43.6532, -79.3832];

  if (validEvents.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No events with location data to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          bgcolor: 'white',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 2,
          minWidth: 150,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Event Timeline
        </Typography>
        <Stack spacing={0.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: '#ff5722',
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">This week</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: '#ff9800',
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">This month</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: '#4caf50',
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">Later</Typography>
          </Box>
        </Stack>
      </Box>

      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds events={validEvents} />

        {validEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.coordinates!.lat, event.coordinates!.lng]}
            icon={createColoredIcon(getEventColor(event))}
          >
            <Popup maxWidth={300} minWidth={250}>
              <Box sx={{ p: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {event.EventName}
                </Typography>

                {/* Categories */}
                {getCategories(event).length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }} flexWrap="wrap">
                    {getCategories(event).slice(0, 2).map((category, index) => (
                      <Chip
                        key={index}
                        label={category}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    ))}
                    {getCategories(event).length > 2 && (
                      <Chip
                        label={`+${getCategories(event).length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Stack>
                )}

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

                {event.PresentedByOrgName && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Presented by: {event.PresentedByOrgName}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default EventMap;
