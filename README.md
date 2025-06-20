# Toronto Events App

A full-stack web application that displays festivals and events in Toronto using data from the City of Toronto's Open Data portal.

## Features

- Browse Toronto festivals and events
- Filter by category, area, and date
- Search events by name
- Responsive design with Material-UI
- Real-time data from Toronto Open Data API

## Data Source

This application fetches live data from the Toronto Open Data portal:
- **API Endpoint**: [Festivals and Events JSON Feed](https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/9201059e-43ed-4369-885e-0b867652feac/resource/8900fdb2-7f6c-4f50-8581-b463311ff05d/download/Festivals%20and%20events%20json%20feed.json)
- **Dataset**: City of Toronto Festivals and Events

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd open-events-to
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Option 1: Run both servers separately (Recommended for development)

1. **Start the backend server** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   The backend will run on http://localhost:3001

2. **Start the frontend development server** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

3. **Access the application**
   Open your browser and navigate to http://localhost:3000

### Option 2: Production build

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**:
   ```bash
   cd ../backend
   npm start
   ```

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/events` - Get all events (with optional filtering)
- `GET /api/events/:id` - Get a specific event
- `GET /api/categories` - Get all unique categories
- `GET /api/areas` - Get all unique areas
- `POST /api/refresh` - Refresh events from the Toronto Open Data API
- `GET /api/health` - Health check endpoint

### Query Parameters for `/api/events`:
- `category` - Filter by event category
- `area` - Filter by area/location
- `search` - Search by event name
- `dateFilter` - Filter by date (today, week, month)

## Running on iPad

Since iPads don't support Node.js natively, you have several options:

### Cloud Development Environments (Recommended)
- **GitHub Codespaces**: Create a codespace from your repository
- **GitPod**: Open your repository in GitPod
- **Replit**: Import your project to Replit

### Deployment Options
- **Frontend**: Deploy to Netlify, Vercel, or GitHub Pages
- **Backend**: Deploy to Heroku, Railway, or Render
- **Full-stack**: Deploy to platforms like Railway or Render

### Example Cloud Setup (GitHub Codespaces)
1. Go to your GitHub repository
2. Click "Code" → "Codespaces" → "Create codespace"
3. Once the environment loads, run the installation and setup commands above
4. The ports will be automatically forwarded, allowing you to access the app in your browser

## Project Structure

```
open-events-to/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── events.xml         # Legacy XML file (no longer used)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── App.tsx        # Main App component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## Technologies Used

### Backend
- Node.js
- Express.js
- CORS middleware
- Native HTTPS module for API calls

### Frontend
- React 19
- TypeScript
- Material-UI (MUI)
- Axios for HTTP requests
- Create React App

## Development Notes

- The application automatically fetches fresh data from the Toronto Open Data API on server startup
- Use the `/api/refresh` endpoint to manually refresh the data
- The backend includes error handling and fallbacks for API failures
- All filtering and searching is performed server-side for better performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
