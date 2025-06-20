import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface Event {
  id: number;
  EventName: string;
  Area: string;
  CategoryList: string | string[];
  PresentedByOrgName: string;
  Image: string;
  ThumbImage?: string;
  ImageAlt?: string;
  DateBeginShow: string;
  TimeBegin: string;
  DateEndShow: string;
  TimeEnd: string;
  Admission: string;
  LongDesc: string | string[];
  Website?: string;
}

export interface EventFilters {
  category?: string;
  area?: string;
  search?: string;
  dateFilter?: 'today' | 'week' | 'month' | 'all';
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'event' | 'category' | 'area' | 'organization' | 'keyword';
}

export interface AutocompleteResponse {
  [category: string]: AutocompleteSuggestion[];
}

export const eventService = {
  // Get all events with optional filters
  getEvents: async (filters: EventFilters = {}): Promise<Event[]> => {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters.area && filters.area !== 'all') {
      params.append('area', filters.area);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.dateFilter && filters.dateFilter !== 'all') {
      params.append('dateFilter', filters.dateFilter);
    }

    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  // Get single event by ID
  getEvent: async (id: number): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get all areas
  getAreas: async (): Promise<string[]> => {
    const response = await api.get('/areas');
    return response.data;
  },

  // Get autocomplete suggestions
  getAutocompleteSuggestions: async (query: string, limit: number = 10): Promise<AutocompleteResponse> => {
    if (!query || query.length < 2) {
      return {};
    }
    
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('limit', limit.toString());
    
    const response = await api.get(`/autocomplete?${params.toString()}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default eventService;
