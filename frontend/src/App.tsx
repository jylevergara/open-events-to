import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { MainLayout } from './components/MainLayout';
import { EventDetails } from './components/EventDetails';

function App() {
  return (
    <FavoritesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/event/:id" element={<EventDetails />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </FavoritesProvider>
  );
}

export default App;
