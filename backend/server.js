const express = require('express');
const cors = require('cors');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store parsed events in memory
let events = [];

// Parse XML file on server startup
function parseEventsXML() {
  try {
    const xmlData = fs.readFileSync(path.join(__dirname, 'events.xml'), 'utf8');
    const parser = new xml2js.Parser();
    
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }
      
      // Extract events from XML structure
      const viewentries = result.viewentries.viewentry || [];
      
      events = viewentries.map((entry, index) => {
        const entrydata = entry.entrydata || [];
        const event = { id: index + 1 };
        
        entrydata.forEach(data => {
          const name = data.$.name;
          let value = '';
          
          if (data.text) {
            if (Array.isArray(data.text)) {
              value = data.text.join(' ');
            } else {
              value = data.text;
            }
          } else if (data.textlist && data.textlist.text) {
            value = data.textlist.text;
          }
          
          event[name] = value;
        });
        
        return event;
      });
      
      console.log(`Loaded ${events.length} events from XML`);
    });
  } catch (error) {
    console.error('Error reading XML file:', error);
  }
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
  
  // Filter by search term
  if (search) {
    filteredEvents = filteredEvents.filter(event =>
      event.EventName && event.EventName.toLowerCase().includes(search.toLowerCase())
    );
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    eventsLoaded: events.length,
    timestamp: new Date().toISOString()
  });
});

// Parse XML on startup
parseEventsXML();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
