// src/services/studentAssignmentsService.js
import apiClient from './api.js';

const ENDPOINT = '/student-assignments';

export const studentAssignmentsService = {
  // List current assignments by route/date/shift
  getAssignments: async ({ route_id, date, shift_type }) => {
    const params = new URLSearchParams({ route_id, date, shift_type }).toString();
    const res = await apiClient.get(`${ENDPOINT}?${params}`);
    return Array.isArray(res) ? res : [];
  },

  // List students not assigned at the given date/shift (global)
  getUnassigned: async ({ date, shift_type, keyword = '' }) => {
    const params = new URLSearchParams({ date, shift_type, keyword }).toString();
    const res = await apiClient.get(`${ENDPOINT}/unassigned?${params}`);
    return Array.isArray(res) ? res : [];
  },

  // Get route stops to choose pickup/dropoff
  getRouteStops: async (route_id) => {
    const params = new URLSearchParams({ route_id }).toString();
    const res = await apiClient.get(`${ENDPOINT}/stops?${params}`);
    // Backend trả về { pickup_stops: [], dropoff_stop: {}, all_stops: [] }
    return res || { pickup_stops: [], dropoff_stop: null, all_stops: [] };
  },

  // Bulk assign students
  bulkAssign: async (payload) => {
    const res = await apiClient.post(`${ENDPOINT}/bulk`, payload);
    return res;
  },

  // Update one assignment
  updateAssignment: async (id, payload) => {
    const res = await apiClient.put(`${ENDPOINT}/${id}`, payload);
    return res;
  },

  // Remove assignment (soft)
  deleteAssignment: async (id) => {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    return res;
  }
};

export default studentAssignmentsService;
