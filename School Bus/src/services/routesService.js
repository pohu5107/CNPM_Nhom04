// routesService.js
// This service handles API calls related to routes.

import axios from 'axios';

const API_BASE_URL = '/api/routes';

const routesService = {
  // Fetch route details by routeId
  getRouteDetails: async (routeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${routeId}/details`);
      return response;
    } catch (error) {
      console.error(`Error fetching route details for routeId: ${routeId}`, error);
      throw error;
    }
  },
};

export default routesService;