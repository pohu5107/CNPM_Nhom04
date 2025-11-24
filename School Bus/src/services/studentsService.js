// src/services/studentsService.js

import apiClient from './api.js';

const ENDPOINT = '/students';

export const studentsService = {
    // Lấy tất cả học sinh
    getAllStudents: async () => {
        try {
            console.log(' Calling GET /students...');
            const response = await apiClient.get(ENDPOINT);
            console.log(' Response from interceptor:', response);
            // Interceptor đã xử lý và trả về data trực tiếp
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error(' Error fetching students:', error);
            throw error;
        }
    },

    // Lấy một học sinh theo ID
    getStudentById: async (id) => {
        try {
            const response = await apiClient.get(`${ENDPOINT}/${id}`);
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error fetching student:', error);
            throw error;
        }
    },

    // Tạo học sinh mới
    createStudent: async (studentData) => {
        try {
            const response = await apiClient.post(ENDPOINT, studentData);
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error creating student:', error);
            throw error;
        }
    },

    // Cập nhật học sinh
    updateStudent: async (id, studentData) => {
        try {
            const response = await apiClient.put(`${ENDPOINT}/${id}`, studentData);
            return response; 
        } catch (error) {
        
            throw error;
        }
    },

    // Xóa học sinh
    deleteStudent: async (id) => {
        try {
            const response = await apiClient.delete(`${ENDPOINT}/${id}`);
            return response; // Response đã được interceptor xử lý
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    },

    // Lấy danh sách lớp học (grades)
    getGrades: () => {
        return [
            { value: '1', label: 'Lớp 1' },
            { value: '2', label: 'Lớp 2' },
            { value: '3', label: 'Lớp 3' },
            { value: '4', label: 'Lớp 4' },
            { value: '5', label: 'Lớp 5' },
            { value: '6', label: 'Lớp 6' },
            { value: '7', label: 'Lớp 7' },
            { value: '8', label: 'Lớp 8' },
            { value: '9', label: 'Lớp 9' },
            { value: '10', label: 'Lớp 10' },
            { value: '11', label: 'Lớp 11' },
            { value: '12', label: 'Lớp 12' }
        ];
    },

    // Validate student data
    validateStudentData: (data) => {
        const errors = {};

        if (!data.name?.trim()) {
            errors.name = 'Tên học sinh là bắt buộc';
        }

        if (!data.grade) {
            errors.grade = 'Lớp học là bắt buộc';
        }

        if (!data.school?.trim()) {
            errors.school = 'Trường học là bắt buộc';
        }

        if (!data.address?.trim()) {
            errors.address = 'Địa chỉ là bắt buộc';
        }

        if (!data.parent_id) {
            errors.parent_id = 'Phụ huynh là bắt buộc';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

export default studentsService;