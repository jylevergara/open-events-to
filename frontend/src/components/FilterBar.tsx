import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { EventFilters } from '../services/api';
import { SearchWithAutocomplete } from './SearchWithAutocomplete';

interface FilterBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  categories: string[];
  areas: string[];
  loading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  categories,
  areas,
  loading = false,
}) => {
  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.category || filters.area || filters.search || filters.dateFilter;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        {/* Search Bar with Autocomplete */}
        <SearchWithAutocomplete
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Search events, categories, areas, organizations..."
          disabled={loading}
        />

        {/* Filter Controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Date</InputLabel>
                <Select
                  value={filters.dateFilter || 'all'}
                  label="Date"
                  onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category || 'all'}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Area</InputLabel>
              <Select
                value={filters.area || 'all'}
                label="Area"
                onChange={(e) => handleFilterChange('area', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="all">All Areas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {hasActiveFilters && (
            <Chip
              label="Clear Filters"
              onClick={clearFilters}
              onDelete={clearFilters}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default FilterBar;
