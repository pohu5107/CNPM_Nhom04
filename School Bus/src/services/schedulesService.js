// src/services/schedulesService.js
import apiClient from './api.js';

const ENDPOINT = '/schedules';

export const schedulesService = {
  getAllSchedules: async () => {
    try {
      const response = await apiClient.get(ENDPOINT);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  getScheduleById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createSchedule: async (data) => await apiClient.post(ENDPOINT, data),
  updateSchedule: async (id, data) => await apiClient.put(`${ENDPOINT}/${id}`, data),
  deleteSchedule: async (id) => await apiClient.delete(`${ENDPOINT}/${id}`)
};

export default schedulesService;
