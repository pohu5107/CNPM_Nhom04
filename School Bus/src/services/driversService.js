// src/services/driversService.js

import apiClient from './api.js';

const ENDPOINT = '/drivers';

export const driversService = {
    // Lấy tất cả tài xế
    getAllDrivers: async () => {
        try {
            const response = await apiClient.get(ENDPOINT);
            console.log('🔵 Drivers response from API:', response);
            return Array.isArray(response) ? response : [];  // response đã được interceptor chuẩn hóa
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    },

    // Lấy một tài xế theo ID
    getDriverById: async (id) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`);
            return response || null;
        } catch (error) {
            console.error('Error fetching driver:', error);
            throw error;
        }
    },

    // Lấy thông tin chi tiết đầy đủ của tài xế
    getDriverDetails: async (id) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}/details`);
            return response || null;
        } catch (error) {
            console.error('Error fetching driver details:', error);
            throw error;
        }
    },

    // Tạo tài xế mới
    createDriver: async (driverData) => {
        try {
            const response = await apiClient.post(ENDPOINT, driverData);
            return response || null;
        } catch (error) {
            console.error('Error creating driver:', error);
            throw error;
        }
    },

    // Cập nhật tài xế
    updateDriver: async (id, driverData) => {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, driverData);
            return response || null;
        } catch (error) {
            console.error('Error updating driver:', error);
            throw error;
        }
    },

    // Xóa tài xế
    deleteDriver: async (id) => {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`);
            return response || null;
        } catch (error) {
            console.error('Error deleting driver:', error);
            throw error;
        }
    },

    // Lấy danh sách trạng thái
    getStatuses: () => {
        return [
            { value: 'active', label: 'Hoạt động', color: 'green' },
            { value: 'inactive', label: 'Tạm nghỉ', color: 'red' },
            { value: 'suspended', label: 'Bị đình chỉ', color: 'orange' }
        ];
    },

    // Validate driver data
    validateDriverData: (data) => {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'Tên tài xế là bắt buộc';
        }

        if (!data.phone?.trim()) {
            errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ''))) {
            errors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        if (!data.license_number?.trim()) {
            errors.license_number = 'Số bằng lái là bắt buộc';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

export default driversService;