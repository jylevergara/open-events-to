import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Stack,
  Badge,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import { Favorite, Event as EventIcon } from '@mui/icons-material';
import { theme } from './theme';
import { eventService, Event, EventFilters } from './services/api';
import { useFavorites } from './hooks/useFavorites';
import { FilterBar } from './components/FilterBar';
import { ViewToggle, ViewMode } from './components/ViewToggle';
import { EventList } from './components/EventList';
import { CalendarExport } from './components/CalendarExport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [filters, setFilters] = useState<EventFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const { favorites, favoritesCount } = useFavorites();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [eventsData, categoriesData, areasData] = await Promise.all([
          eventService.getEvents(),
          eventService.getCategories(),
          eventService.getAreas(),
        ]);
        
        setEvents(eventsData);
        setCategories(categoriesData);
        setAreas(areasData);
        setError(null);
      } catch (err) {
        setError('Failed to load events. Please check if the backend server is running.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load events when filters change
  useEffect(() => {
    const loadFilteredEvents = async () => {
      if (tabValue !== 0) return; // Only load for "All Events" tab
      
      try {
        setLoading(true);
        const filteredEvents = await eventService.getEvents(filters);
        setEvents(filteredEvents);
        setError(null);
      } catch (err) {
        setError('Failed to load filtered events.');
        console.error('Error loading filtered events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFilteredEvents();
  }, [filters, tabValue]);

  // Load favorite events when favorites change or tab switches to favorites
  useEffect(() => {
    const loadFavoriteEvents = async () => {
      if (tabValue !== 1 || favorites.length === 0) {
        setFavoriteEvents([]);
        return;
      }

      try {
        const allEvents = await eventService.getEvents();
        const favEvents = allEvents.filter(event => favorites.includes(event.id));
        setFavoriteEvents(favEvents);
      } catch (err) {
        console.error('Error loading favorite events:', err);
      }
    };

    loadFavoriteEvents();
  }, [favorites, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Toronto Events Hub
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            Discover • Save • Attend
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="event tabs">
            <Tab 
              label="All Events" 
              icon={<EventIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={
                <Badge badgeContent={favoritesCount} color="error">
                  Favorites
                </Badge>
              }
              icon={<Favorite />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* All Events Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            {/* Filters and View Toggle */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'flex-start' },
              gap: 2
            }}>
              <Box sx={{ flex: 1 }}>
                <FilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                  areas={areas}
                  loading={loading}
                />
              </Box>
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </Box>

            {/* Events List */}
            <EventList events={events} viewMode={viewMode} loading={loading} />
          </Stack>
        </TabPanel>

        {/* Favorites Tab */}
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            {/* Favorites Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h6">
                Your Favorite Events ({favoritesCount})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <CalendarExport events={favoriteEvents} />
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              </Box>
            </Box>

            {/* Favorite Events List */}
            {favoriteEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Favorite sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No favorite events yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse events and click the heart icon to save your favorites!
                </Typography>
              </Box>
            ) : (
              <EventList events={favoriteEvents} viewMode={viewMode} />
            )}
          </Stack>
        </TabPanel>
      </Container>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
