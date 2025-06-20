import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { eventService, AutocompleteResponse, AutocompleteSuggestion } from '../services/api';

interface SearchWithAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchWithAutocomplete: React.FC<SearchWithAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search events...",
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState<AutocompleteResponse>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Flatten suggestions for keyboard navigation
  const flatSuggestions = React.useMemo(() => {
    const flat: (AutocompleteSuggestion & { categoryName: string })[] = [];
    Object.entries(suggestions).forEach(([categoryName, items]: [string, AutocompleteSuggestion[]]) => {
      items.forEach((item: AutocompleteSuggestion) => {
        flat.push({ ...item, categoryName });
      });
    });
    return flat;
  }, [suggestions]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions({});
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await eventService.getAutocompleteSuggestions(query, 15);
      
      // Filter to only show events in the dropdown
      const filteredResponse: AutocompleteResponse = {};
      Object.entries(response).forEach(([categoryName, items]) => {
        const eventItems = items.filter(item => item.type === 'event');
        if (eventItems.length > 0) {
          filteredResponse[categoryName] = eventItems;
        }
      });
      
      setSuggestions(filteredResponse);
      setShowSuggestions(Object.keys(filteredResponse).length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({});
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [fetchSuggestions]);

  useEffect(() => {
    debouncedFetchSuggestions(value);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debouncedFetchSuggestions]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showSuggestions || flatSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < flatSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : flatSuggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
          handleSuggestionClick(flatSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return '🎪';
      case 'category':
        return '🏷️';
      case 'area':
        return '📍';
      case 'organization':
        return '🏢';
      case 'keyword':
        return '🔍';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'primary';
      case 'category':
        return 'secondary';
      case 'area':
        return 'success';
      case 'organization':
        return 'info';
      case 'keyword':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        ref={inputRef}
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (value.length >= 2 && Object.keys(suggestions).length > 0) {
            setShowSuggestions(true);
          }
        }}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <Search color="action" />
              )}
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <Clear
                sx={{ cursor: 'pointer', color: 'action.active' }}
                onClick={handleClear}
              />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      {showSuggestions && Object.keys(suggestions).length > 0 && (
        <Paper
          ref={suggestionsRef}
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
            mt: 0.5,
          }}
        >
          <List dense>
            {Object.entries(suggestions).map(([categoryName, items], categoryIndex) => (
              <React.Fragment key={categoryName}>
                {categoryIndex > 0 && <Divider />}
                <ListItem sx={{ py: 0.5, backgroundColor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    {categoryName}
                  </Typography>
                </ListItem>
                {items.map((suggestion, itemIndex) => {
                  const flatIndex = flatSuggestions.findIndex(
                    (item) => item.text === suggestion.text && item.categoryName === categoryName
                  );
                  const isSelected = flatIndex === selectedIndex;
                  
                  return (
                    <ListItem
                      key={`${categoryName}-${itemIndex}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        pl: 3,
                        py: 0.5,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        ...(isSelected && {
                          backgroundColor: 'action.selected',
                        }),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography sx={{ fontSize: '1rem' }}>
                          {getTypeIcon(suggestion.type)}
                        </Typography>
                        <ListItemText
                          primary={suggestion.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            noWrap: true,
                          }}
                        />
                        <Chip
                          label={suggestion.type}
                          size="small"
                          color={getTypeColor(suggestion.type) as any}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    </ListItem>
                  );
                })}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchWithAutocomplete;
