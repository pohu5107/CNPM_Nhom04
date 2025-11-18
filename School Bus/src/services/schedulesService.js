import apiClient from './api.js';

const ENDPOINT = '/schedules';

export const schedulesService = {
    getAllSchedules: async () => {
        try {
            const response = await apiClient.get('/admin-schedules');
            return Array.isArray(response) ? response : [];
        } catch (error) {
            throw error;
        }
    },

    getDriverSchedules: async (driverId, params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${ENDPOINT}/driver/${driverId}${queryString ? `?${queryString}` : ''}`;
            const response = await apiClient.get(url);

            if (response && response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else if (response && response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (Array.isArray(response)) {
                return response;
            }

            return [];
        } catch (error) {
            throw error;
        }
    },

    getScheduleById: async (id, driverId = 1) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${driverId}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getAdminScheduleById: async (id) => {
        try {
            const response = await apiClient.get(`/admin-schedules/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createSchedule: async (data) => {
        try {
            const response = await apiClient.post('/admin-schedules', data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateSchedule: async (id, data) => {
        try {
            const response = await apiClient.put(`/admin-schedules/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteSchedule: async (id) => {
        try {
            const response = await apiClient.delete(`/admin-schedules/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateScheduleStatus: async (id, status, notes = null) => {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}/status`, {
                status,
                notes
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    getScheduleStops: async (driverId, scheduleId) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/driver/${driverId}/stops/${scheduleId}`);
            if (response && response.data && response.data.stops && Array.isArray(response.data.stops)) {
                return response.data;
            } else if (response && response.stops && Array.isArray(response.stops)) {
                return response;
            }
            return { stops: [] };
        } catch (error) {
            throw error;
        }
    },

    getMapData: async (scheduleId) => {
        try {
            const mapData = await apiClient.get(`${ENDPOINT}/${scheduleId}/map-data`);

            if (mapData && mapData.schedule) {
                return mapData;
            } else {
                throw new Error('Invalid map data: missing schedule information');
            }
        } catch (error) {
            throw error;
        }
    },

};

export default schedulesService;