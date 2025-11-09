// src/services/busesService.js

import apiClient from './api.js';

const ENDPOINT = '/buses';

export const busesService = {
    // Lấy tất cả xe buýt
    getAllBuses: async () => {
        try {
            console.log(' Calling GET /buses...');
            const response = await apiClient.get(ENDPOINT);
            console.log(' Response from interceptor:', response);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error(' Error fetching buses:', error);
            throw error;
        }
    },

    // Lấy một xe theo ID
    getBusById: async (id) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`);
            return response;
        } catch (error) {
            console.error(' Error fetching bus:', error);
            throw error;
        }
    },

    // Tạo xe mới
    createBus: async (busData) => {
        try {
            const response = await apiClient.post(ENDPOINT, busData);
            return response;
        } catch (error) {
            console.error(' Error creating bus:', error);
            throw error;
        }
    },

    // Cập nhật xe
    updateBus: async (id, busData) => {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, busData);
            return response;
        } catch (error) {
            console.error(' Error updating bus:', error);
            throw error;
        }
    },

    // Xóa xe
    deleteBus: async (id) => {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`);
            return response;
        } catch (error) {
            console.error(' Error deleting bus:', error);
            throw error;
        }
    },

    // Validate dữ liệu bus trước khi gửi lên API
    validateBusData: (data) => {
        const errors = {};

        if (!data.bus_number?.trim()) {
            errors.bus_number = 'Số hiệu xe là bắt buộc';
        }

        if (!data.license_plate?.trim()) {
            errors.license_plate = 'Biển số xe là bắt buộc';
        }

        const validStatuses = ['active', 'maintenance', 'inactive'];
        if (data.status && !validStatuses.includes(data.status)) {
            errors.status = `Trạng thái không hợp lệ. Chỉ có thể là: ${validStatuses.join(', ')}`;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

export default busesService;
