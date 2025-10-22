// /src/services/classesService.js

import api from './api';

export const classesService = {
  // Lấy tất cả lớp học
  getAllClasses: async () => {
    try {
      const response = await api.get('/classes');
      console.log('🔵 Classes response from API:', response);
      return response.data || [];  // response đã được interceptor xử lý
    } catch (error) {
      console.error('Error in getAllClasses:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết 1 lớp
  getClassById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error in getClassById:', error);
      throw error;
    }
  },

  // Lấy thống kê lớp học
  getClassStatistics: async () => {
    try {
      const response = await api.get('/classes/statistics/all');
      return response.data.data;
    } catch (error) {
      console.error('Error in getClassStatistics:', error);
      throw error;
    }
  }
};
