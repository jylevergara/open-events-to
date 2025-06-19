import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  eventId: number;
  size?: 'small' | 'medium' | 'large';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  eventId, 
  size = 'medium' 
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(eventId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click when clicking favorite button
    toggleFavorite(eventId);
  };

  return (
    <Tooltip title={favorited ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton
        onClick={handleClick}
        size={size}
        sx={{
          color: favorited ? 'error.main' : 'action.disabled',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            color: 'error.main',
            transform: 'scale(1.1)',
          },
        }}
      >
        {favorited ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
    </Tooltip>
  );
};

export default FavoriteButton;
