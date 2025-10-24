// src/services/schedulesService.js

import apiClient from './api.js';

const ENDPOINT = '/schedules';

export const schedulesService = {
    // Lấy lịch làm việc của driver
    getDriverSchedules: async (driverId, params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${ENDPOINT}/driver/${driverId}${queryString ? `?${queryString}` : ''}`;
            
            const response = await apiClient.get(url);
            console.log('🔵 Driver schedules response:', response);
            // Response đã được interceptor xử lý, trả về trực tiếp
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error fetching driver schedules:', error);
            throw error;
        }
    },

    // Lấy chi tiết một lịch làm việc
    getScheduleById: async (id) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`);
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error fetching schedule detail:', error);
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
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error updating schedule status:', error);
            throw error;
        }
    },

    // Lấy thống kê tổng quan
    getDriverSummary: async (driverId, date = null) => {
        try {
            const params = date ? `?date=${date}` : '';
            const response = await apiClient.get(`${ENDPOINT}/driver/${driverId}/summary${params}`);
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error fetching driver summary:', error);
            throw error;
        }
    },

    // Lấy danh sách điểm dừng thực tế cho một lịch trình
    getScheduleStops: async (driverId, scheduleId) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/driver/${driverId}/stops/${scheduleId}`);
            console.log('🔵 Schedule stops response:', response);
            
            // Interceptor đã xử lý response, trả về data object
            // Backend trả về: {scheduleId, routeId, routeName, totalStops, stops}
            if (response && response.stops && Array.isArray(response.stops)) {
                return response; // Trả về toàn bộ object chứa thông tin route và stops
            }
            
            return { stops: [] }; // Fallback với empty stops array
        } catch (error) {
            console.error('Error fetching schedule stops:', error);
            throw error;
        }
    },

    // Lấy trạng thái có sẵn
    getStatuses: () => {
        return [
            { value: 'scheduled', label: 'Chưa bắt đầu', color: 'gray', icon: '⏳' },
            { value: 'in_progress', label: 'Đang chạy', color: 'blue', icon: '🚍' },
            { value: 'completed', label: 'Hoàn thành', color: 'green', icon: '✅' },
            { value: 'cancelled', label: 'Đã hủy', color: 'red', icon: '❌' }
        ];
    },

    // Format thời gian
    formatTime: (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // HH:MM
    },

    // Format ngày
    formatDate: (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Kiểm tra ca làm việc có thể bắt đầu không
    canStartShift: (schedule) => {
        if (schedule.status !== 'scheduled') return false;
        
        const now = new Date();
        const scheduleDate = new Date(schedule.date);
        const startTime = schedule.start_time;
        
        // Kiểm tra ngày
        if (scheduleDate.toDateString() !== now.toDateString()) {
            return false;
        }
        
        // Kiểm tra thời gian (cho phép bắt đầu trước 15 phút)
        const [hours, minutes] = startTime.split(':').map(Number);
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);
        
        const diffMinutes = (scheduleTime - now) / (1000 * 60);
        return diffMinutes <= 15 && diffMinutes >= -30; // 15 phút trước đến 30 phút sau
    }
};

export default schedulesService;