const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store parsed events in memory
let events = [];
let lastFetchTime = null;
let isUsingFallback = false;

// Transform event data to consistent format
function transformEventData(eventWrapper, index) {
  const event = eventWrapper.calEvent || eventWrapper;
  
  // Extract location information
  let address = '';
  let area = '';
  if (event.locations && event.locations.length > 0) {
    address = event.locations[0].address || '';
    area = event.locations[0].locationName || '';
  }
  
  // Extract category information
  let categoryList = '';
  if (event.category && Array.isArray(event.category)) {
    categoryList = event.category.map(cat => cat.name).join(', ');
  } else if (event.categoryString) {
    categoryList = event.categoryString;
  }
  
  // Extract cost information
  let cost = 'Free';
  if (event.freeEvent === 'No' && event.cost) {
    if (typeof event.cost === 'object') {
      if (event.cost.ga) cost = `$${event.cost.ga}`;
      else if (event.cost.adult) cost = `$${event.cost.adult}`;
      else if (event.cost.from && event.cost.to) cost = `$${event.cost.from} - $${event.cost.to}`;
      else cost = 'Paid';
    } else {
      cost = event.cost;
    }
  }
  
  // Extract dates
  let startDate = '';
  let endDate = '';
  if (event.dates && event.dates.length > 0) {
    startDate = event.dates[0].startDateTime || event.startDateTime || event.startDate;
    endDate = event.dates[0].endDateTime || event.endDateTime || event.endDate;
  } else {
    startDate = event.startDateTime || event.startDate;
    endDate = event.endDateTime || event.endDate;
  }
  
  return {
    id: index + 1,
    EventName: event.eventName || '',
    Description: event.description || '',
    DateBeginShow: startDate,
    DateEndShow: endDate,
    Area: area,
    CategoryList: categoryList,
    Address: address,
    Phone: event.eventPhone || event.orgPhone || '',
    Email: event.eventEmail || event.orgEmail || '',
    Website: event.eventWebsite || '',
    Cost: cost,
    originalEvent: event // Keep original data for reference
  };
}

// Load events from local fallback file
function loadFallbackEvents() {
  try {
    const fallbackPath = path.join(__dirname, 'event-data.json');
    const fallbackData = fs.readFileSync(fallbackPath, 'utf8');
    const jsonData = JSON.parse(fallbackData);
    
    events = jsonData.map(transformEventData);
    isUsingFallback = true;
    lastFetchTime = new Date();
    
    console.log(`Loaded ${events.length} events from fallback file (event-data.json)`);
  } catch (error) {
    console.error('Error loading fallback events:', error);
    events = [];
  }
}

// Fetch events from Toronto Open Data JSON API
function fetchEventsFromAPI() {
  const url = 'https://secure.toronto.ca/cc_sr_v1/data/edc_eventcal_APR?limit=500'
  
  console.log('Fetching events from Toronto Open Data API...');
  
  const request = https.get(url, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        // Transform the JSON data to match the expected structure
        events = jsonData.map(transformEventData);
        isUsingFallback = false;
        lastFetchTime = new Date();
        
        console.log(`Successfully loaded ${events.length} events from Toronto Open Data API`);
      } catch (error) {
        console.error('Error parsing JSON data from API:', error);
        console.log('Falling back to local event data...');
        loadFallbackEvents();
      }
    });
  });
  
  request.on('error', (error) => {
    console.error('Error fetching events from API:', error);
    console.log('Falling back to local event data...');
    loadFallbackEvents();
  });
  
  request.setTimeout(15000, () => {
    console.error('Request timeout when fetching events from API');
    request.destroy();
    console.log('Falling back to local event data...');
    loadFallbackEvents();
  });
}

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
  const { category, area, search, dateFilter } = req.query;
  let filteredEvents = [...events];
  
  // Filter by category
  if (category && category !== 'all') {
    filteredEvents = filteredEvents.filter(event => {
      const categories = Array.isArray(event.CategoryList) 
        ? event.CategoryList 
        : [event.CategoryList];
      return categories.some(cat => 
        cat && cat.toLowerCase().includes(category.toLowerCase())
      );
    });
  }
  
  // Filter by area
  if (area && area !== 'all') {
    filteredEvents = filteredEvents.filter(event => 
      event.Area && event.Area.toLowerCase().includes(area.toLowerCase())
    );
  }
  
  // Filter by search term (enhanced search across multiple fields)
  if (search) {
    const searchLower = search.toLowerCase();
    filteredEvents = filteredEvents.filter(event => {
      // Search in event name
      if (event.EventName && event.EventName.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in description
      if (event.Description && event.Description.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in categories
      if (event.CategoryList) {
        const categories = Array.isArray(event.CategoryList) 
          ? event.CategoryList 
          : [event.CategoryList];
        if (categories.some(cat => cat && cat.toLowerCase().includes(searchLower))) {
          return true;
        }
      }
      
      // Search in area
      if (event.Area && event.Area.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in organization name
      if (event.originalEvent && event.originalEvent.orgName && 
          event.originalEvent.orgName.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Filter by date (simplified for hackathon)
  if (dateFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    filteredEvents = filteredEvents.filter(event => {
      if (!event.DateBeginShow) return true;
      
      try {
        const eventDate = new Date(event.DateBeginShow);
        
        switch (dateFilter) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDate >= today && eventDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            return eventDate >= today && eventDate <= monthFromNow;
          default:
            return true;
        }
      } catch (error) {
        return true;
      }
    });
  }
  
  res.json(filteredEvents);
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json(event);
});

// Get unique categories
app.get('/api/categories', (req, res) => {
  const categories = new Set();
  
  events.forEach(event => {
    if (event.CategoryList) {
      const cats = Array.isArray(event.CategoryList) 
        ? event.CategoryList 
        : [event.CategoryList];
      cats.forEach(cat => {
        if (cat && cat.trim()) {
          categories.add(cat.trim());
        }
      });
    }
  });
  
  res.json(Array.from(categories).sort());
});

// Get unique areas
app.get('/api/areas', (req, res) => {
  const areas = new Set();
  
  events.forEach(event => {
    if (event.Area && event.Area.trim()) {
      areas.add(event.Area.trim());
    }
  });
  
  res.json(Array.from(areas).sort());
});

// Get autocomplete suggestions
app.get('/api/autocomplete', (req, res) => {
  const { query, limit = 10 } = req.query;
  
  if (!query || query.length < 2) {
    return res.json({});
  }
  
  const suggestions = [];
  const queryLower = query.toLowerCase();
  const seen = new Set(); // To avoid duplicates
  
  events.forEach(event => {
    // Only search in event names
    if (event.EventName && event.EventName.toLowerCase().includes(queryLower)) {
      const key = `event-${event.EventName}`;
      if (!seen.has(key)) {
        suggestions.push({
          text: event.EventName,
          type: 'event',
          category: 'Events'
        });
        seen.add(key);
      }
    }
  });
  
  // Limit results and group by category
  const limitedSuggestions = suggestions
    .filter(s => s.text && s.text.trim().length > 0)
    .slice(0, parseInt(limit));
  
  // Group by category
  const grouped = limitedSuggestions.reduce((acc, suggestion) => {
    const categoryName = suggestion.category;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    // Remove the category property from individual suggestions since it's now the key
    const { category, ...suggestionWithoutCategory } = suggestion;
    acc[categoryName].push(suggestionWithoutCategory);
    return acc;
  }, {});
  
  res.json(grouped);
});

// Refresh events from API
app.post('/api/refresh', (req, res) => {
  console.log('Refreshing events from API...');
  fetchEventsFromAPI();
  res.json({ 
    message: 'Events refresh initiated',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    eventsLoaded: events.length,
    dataSource: isUsingFallback ? 'Local fallback file (event-data.json)' : 'Toronto Open Data API',
    lastFetchTime: lastFetchTime ? lastFetchTime.toISOString() : null,
    timestamp: new Date().toISOString()
  });
});

// Fetch events from API on startup
fetchEventsFromAPI();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
