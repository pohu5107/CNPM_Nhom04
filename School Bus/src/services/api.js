// src/services/api.js

import axios from 'axios';

// Base API URL - có thể config từ environment
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor để thêm auth token (nếu cần)
apiClient.interceptors.request.use(
    (config) => {
        // Có thể thêm auth token ở đây
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle different error types
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            console.error('Unauthorized access');
        } else if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status >= 500) {
            console.error('Server error');
        }
        
        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;