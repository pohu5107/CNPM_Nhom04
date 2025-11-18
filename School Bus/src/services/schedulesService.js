// src/services/schedulesService.js
import apiClient from './api.js';

const ENDPOINT = '/schedules';

export const schedulesService = {
    // Lấy tất cả lịch trình (Admin)
    getAllSchedules: async () => {
        try {
            const response = await apiClient.get('/admin-schedules');
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        }
    },

    // Lấy lịch làm việc của driver
    getDriverSchedules: async (driverId, params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${ENDPOINT}/driver/${driverId}${queryString ? `?${queryString}` : ''}`;
            const response = await apiClient.get(url);
            
            // Handle response format from backend
            if (response && response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else if (response && response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (Array.isArray(response)) {
                return response;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching driver schedules:', error);
            throw error;
        }
    },

    // Lấy chi tiết một lịch làm việc (cho driver)
    getScheduleById: async (id, driverId = 1) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${driverId}/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching schedule detail:', error);
            throw error;
        }
    },

    // Lấy chi tiết một lịch trình (cho admin)
    getAdminScheduleById: async (id) => {
        try {
            const response = await apiClient.get(`/admin-schedules/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching admin schedule detail:', error);
            throw error;
        }
    },

    // Tạo lịch trình mới
    createSchedule: async (data) => {
        try {
            const response = await apiClient.post('/admin-schedules', data);
            return response;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    },

    // Cập nhật lịch trình
    updateSchedule: async (id, data) => {
        try {
            const response = await apiClient.put(`/admin-schedules/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    },

    // Xóa lịch trình
    deleteSchedule: async (id) => {
        try {
            const response = await apiClient.delete(`/admin-schedules/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái lịch làm việc
    updateScheduleStatus: async (id, status, notes = null) => {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}/status`, {
                status,
                notes
            });
            return response;
        } catch (error) {
            console.error('Error updating schedule status:', error);
            throw error;
        }
    },

 

    // Lấy danh sách điểm dừng thực tế cho một lịch trình
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


};

export default schedulesService;
