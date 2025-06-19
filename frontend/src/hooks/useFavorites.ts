import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'toronto-events-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  const addFavorite = (eventId: number) => {
    setFavorites(prev => {
      if (!prev.includes(eventId)) {
        return [...prev, eventId];
      }
      return prev;
    });
  };

  const removeFavorite = (eventId: number) => {
    setFavorites(prev => prev.filter(id => id !== eventId));
  };

  const toggleFavorite = (eventId: number) => {
    if (favorites.includes(eventId)) {
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
  };

  const isFavorite = (eventId: number) => {
    return favorites.includes(eventId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
};
