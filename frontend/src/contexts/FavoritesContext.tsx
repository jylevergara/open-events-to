import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

const FAVORITES_KEY = 'toronto-events-favorites';

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (eventId: number) => void;
  removeFavorite: (eventId: number) => void;
  toggleFavorite: (eventId: number) => void;
  isFavorite: (eventId: number) => boolean;
  clearFavorites: () => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const isInitialized = useRef(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (savedFavorites) {
        console.log("mount");
        setFavorites(JSON.parse(savedFavorites));
      }
      isInitialized.current = true;
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      isInitialized.current = true;
    }
  }, []);

  // Save favorites to localStorage whenever favorites change (but not on initial mount)
  useEffect(() => {
    if (!isInitialized.current) return;
    
    try {
      console.log('saving favorites');
      console.log(favorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  const addFavorite = (eventId: number) => {
    setFavorites(prev => {
      console.log("add fav");
      if (!prev.includes(eventId)) {
        console.log(prev);
        console.log([...prev, eventId]);
        return [...prev, eventId];
      }
      console.log(prev);
      return prev;
    });
  };

  const removeFavorite = (eventId: number) => {
    setFavorites(prev => prev.filter(id => id !== eventId));
  };

  const toggleFavorite = (eventId: number) => {
    console.log('toggle');
    if (favorites.includes(eventId)) {
      console.log('remove');
      removeFavorite(eventId);
    } else {
      console.log('add');
      addFavorite(eventId);
    }
  };

  const isFavorite = (eventId: number) => {
    return favorites.includes(eventId);
  };

  const clearFavorites = () => {
    console.log('clearing');
    setFavorites([]);
  };

  const value: FavoritesContextType = {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
