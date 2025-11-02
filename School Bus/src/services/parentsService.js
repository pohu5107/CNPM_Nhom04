// src/services/parentsService.js

import apiClient from './api.js';

const ENDPOINT = '/parents';

export const parentsService = {
    // Lấy tất cả phụ huynh
    getAllParents: async () => {
        try {
            const response = await apiClient.get(ENDPOINT);
            console.log('🔵 Parents response from API:', response);
            return Array.isArray(response) ? response : [];  // response đã được interceptor chuẩn hóa
        } catch (error) {
            console.error('Error fetching parents:', error);
            throw error;
        }
    },

    // Lấy một phụ huynh theo ID
    getParentById: async (id) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`);
            return response || null;
        } catch (error) {
            console.error('Error fetching parent:', error);
            throw error;
        }
    },

    // Lấy danh sách con của phụ huynh
    getParentChildren: async (id) => {
        try {
            console.log('🔵 Getting children for parent:', id);
            const response = await apiClient.get(`${ENDPOINT}/${id}/children`);
            console.log('✅ Children response:', response);
            return Array.isArray(response) ? response : [];  // response đã được interceptor chuẩn hóa
        } catch (error) {
            console.error('Error fetching parent children:', error);
            throw error;
        }
    },

    // Tạo phụ huynh mới
    createParent: async (parentData) => {
        try {
            console.log('🔵 Creating parent with data:', parentData);
            const response = await apiClient.post(ENDPOINT, parentData);
            return response || null;
        } catch (error) {
            console.error('Error creating parent:', error);
            throw error;
        }
    },

    // Cập nhật phụ huynh
    updateParent: async (id, parentData) => {
        try {
            console.log('🔵 Updating parent with data:', parentData);
            const response = await apiClient.put(`${ENDPOINT}/${id}`, parentData);
            return response || null;
        } catch (error) {
            console.error('Error updating parent:', error);
            throw error;
        }
    },

    // Xóa phụ huynh
    deleteParent: async (id) => {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`);
            return response || null;
        } catch (error) {
            console.error('Error deleting parent:', error);
            throw error;
        }
    },

    // Lấy danh sách trạng thái
    getStatuses: () => {
        return [
            { value: 'active', label: 'Hoạt động', color: 'green' },
            { value: 'inactive', label: 'Không hoạt động', color: 'red' }
        ];
    },

    // Validate parent data
    validateParentData: (data) => {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'Tên phụ huynh là bắt buộc';
        }

        if (!data.phone?.trim()) {
            errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ''))) {
            errors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Email không hợp lệ';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

export default parentsService;