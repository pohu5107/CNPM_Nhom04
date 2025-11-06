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
            console.log('🔵 Driver schedules response:', response);
            // Response đã được interceptor xử lý, trả về data array
            return Array.isArray(response.data) ? response.data : 
                   Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error fetching driver schedules:', error);
            throw error;
        }
    },

    // Lấy chi tiết một lịch làm việc (cho driver)
    getScheduleById: async (id, driverId = 1) => {
        try {
            // Sử dụng route driver-specific để đảm bảo chỉ lấy schedule của driver đó
            const response = await apiClient.get(`${ENDPOINT}/${driverId}/${id}`);
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error fetching schedule detail:', error);
            throw error;
        }
    },

    // Lấy chi tiết một lịch trình (cho admin)
    getAdminScheduleById: async (id) => {
        try {
            const response = await apiClient.get(`/admin-schedules/${id}`);
            return response; // Response đã được interceptor xử lý
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
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error updating schedule status:', error);
            throw error;
        }
    },

    // Lấy schedules cho admin
    getAdminSchedules: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${ENDPOINT}/admin${queryString ? `?${queryString}` : ''}`;
            
            const response = await apiClient.get(url);
            console.log('🔵 Admin schedules response:', response);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Error fetching admin schedules:', error);
            throw error;
        }
    },

    // Lấy students của schedule theo route từ database  
    getScheduleStudentsByRoute: async (scheduleId) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${scheduleId}/students-by-route`);
            console.log('🔵 Schedule students response:', response);
            return {
                students: Array.isArray(response.data) ? response.data : [],
                route_info: response.route_info || {}
            };
        } catch (error) {
            console.error('Error fetching schedule students:', error);
            throw error;
        }
    },

    // Lấy thống kê tổng quan
    getDriverSummary: async (driverId, date = null) => {
        try {
            const params = date ? `?date=${date}` : '';
            const response = await apiClient.get(`${ENDPOINT}/driver/${driverId}/summary${params}`);
            // Response được interceptor xử lý, trả về data
            return response.data || response;
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
            if (response && response.data && response.data.stops && Array.isArray(response.data.stops)) {
                return response.data; // Trả về toàn bộ object chứa thông tin route và stops
            } else if (response && response.stops && Array.isArray(response.stops)) {
                return response; // Fallback nếu data ở level cao hơn
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
