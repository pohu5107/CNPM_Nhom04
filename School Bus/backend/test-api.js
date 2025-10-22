// backend/test-api.js
// File test để kiểm tra API endpoints

import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Test functions
const testHealthCheck = async () => {
    try {
        const response = await axios.get(`${API_URL}/health`);
        console.log('✅ Health Check:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Health Check failed:', error.message);
        return false;
    }
};

const testStudentsAPI = async () => {
    console.log('\n📚 Testing Students API...');
    
    try {
        // Test GET all students
        const students = await axios.get(`${API_URL}/students`);
        console.log('✅ GET /students:', students.data);

        // Test POST new student (this will fail without proper database)
        // const newStudent = await axios.post(`${API_URL}/students`, {
        //     name: 'Nguyễn Văn Test',
        //     grade: '5',
        //     school: 'Trường Tiểu học Test',
        //     address: 'Địa chỉ test',
        //     parent_id: 1
        // });
        // console.log('✅ POST /students:', newStudent.data);
        
    } catch (error) {
        console.log('❌ Students API failed:', error.response?.data || error.message);
    }
};

const testDriversAPI = async () => {
    console.log('\n🚗 Testing Drivers API...');
    
    try {
        const drivers = await axios.get(`${API_URL}/drivers`);
        console.log('✅ GET /drivers:', drivers.data);
    } catch (error) {
        console.log('❌ Drivers API failed:', error.response?.data || error.message);
    }
};

const testParentsAPI = async () => {
    console.log('\n👨‍👩‍👧‍👦 Testing Parents API...');
    
    try {
        const parents = await axios.get(`${API_URL}/parents`);
        console.log('✅ GET /parents:', parents.data);
    } catch (error) {
        console.log('❌ Parents API failed:', error.response?.data || error.message);
    }
};

// Main test function
const runTests = async () => {
    console.log('🚌 Starting API Tests...\n');
    
    const isHealthy = await testHealthCheck();
    if (!isHealthy) {
        console.log('❌ Server is not running. Please start the server first.');
        return;
    }

    await testStudentsAPI();
    await testDriversAPI();
    await testParentsAPI();
    
    console.log('\n✅ API Tests completed!');
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests();
}

export { runTests };