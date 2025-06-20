import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Stack,
  Badge,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { Favorite, Event as EventIcon, ExploreOutlined } from '@mui/icons-material';
import { eventService, Event, EventFilters } from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';
import { FilterBar } from './FilterBar';
import { ViewToggle, ViewMode } from './ViewToggle';
import { EventList } from './EventList';
import { CalendarExport } from './CalendarExport';

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

const WelcomeSection: React.FC = () => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: { xs: 'auto', md: '400px' },
        alignItems: 'center'
      }}>
        {/* Image Section */}
        <Box sx={{ 
          flex: { xs: '0 0 auto', md: '0 0 45%' },
          width: { xs: '100%', md: '45%' },
          height: { xs: '250px', md: '400px' },
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Toronto skyline"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.8)',
            }}
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(30,60,114,0.3) 0%, rgba(42,82,152,0.1) 100%)'
          }} />
        </Box>

        {/* Content Section */}
        <Box sx={{ 
          flex: 1,
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Welcome to Your Toronto Events Hub!
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4,
              lineHeight: 1.6,
              opacity: 0.95,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 400
            }}
          >
            Looking for what’s happening in the Six? You’ve come to the right place. From street festivals to secret shows, food markets to museum nights — we’ve got your next plan covered. Whether you're local or just visiting, explore the best events across Toronto and the GTA. Let’s get you out there!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ExploreOutlined />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Explore Events
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Plan Your Visit
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
    </Paper>
  );
};

export const MainLayout: React.FC = () => {
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
    <>
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600, color: 'white' }}>
            Toronto Events Hub
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            Discover • Save • Attend
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Navigation Tabs */}
        <WelcomeSection />
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
    </>
  );
};

export default MainLayout;
