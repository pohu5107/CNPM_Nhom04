import { useState, useEffect } from 'react';
import { mockParents, mockStudents, mockDrivers } from '../data/mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Custom hook for fake API operations
export const useFakeApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call simulator
  const apiCall = async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      await delay(500); // Simulate network delay
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Parents API
  const parentsApi = {
    getAll: () => apiCall(() => Promise.resolve([...mockParents])),
    getById: (id) => apiCall(() => {
      const parent = mockParents.find(p => p.id === id);
      if (!parent) throw new Error('Parent not found');
      return Promise.resolve(parent);
    }),
    create: (data) => apiCall(() => {
      const newParent = {
        ...data,
        id: Math.max(...mockParents.map(p => p.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0],
        children: []
      };
      mockParents.push(newParent);
      return Promise.resolve(newParent);
    }),
    update: (id, data) => apiCall(() => {
      const index = mockParents.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Parent not found');
      mockParents[index] = { ...mockParents[index], ...data };
      return Promise.resolve(mockParents[index]);
    }),
    delete: (id) => apiCall(() => {
      const index = mockParents.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Parent not found');
      mockParents.splice(index, 1);
      return Promise.resolve(true);
    })
  };

  // Students API
  const studentsApi = {
    getAll: () => apiCall(() => Promise.resolve([...mockStudents])),
    getById: (id) => apiCall(() => {
      const student = mockStudents.find(s => s.id === id);
      if (!student) throw new Error('Student not found');
      return Promise.resolve(student);
    }),
    create: (data) => apiCall(() => {
      const newStudent = {
        ...data,
        id: Math.max(...mockStudents.map(s => s.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      mockStudents.push(newStudent);
      return Promise.resolve(newStudent);
    }),
    update: (id, data) => apiCall(() => {
      const index = mockStudents.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Student not found');
      mockStudents[index] = { ...mockStudents[index], ...data };
      return Promise.resolve(mockStudents[index]);
    }),
    delete: (id) => apiCall(() => {
      const index = mockStudents.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Student not found');
      mockStudents.splice(index, 1);
      return Promise.resolve(true);
    })
  };

  // Drivers API
  const driversApi = {
    getAll: () => apiCall(() => Promise.resolve([...mockDrivers])),
    getById: (id) => apiCall(() => {
      const driver = mockDrivers.find(d => d.id === id);
      if (!driver) throw new Error('Driver not found');
      return Promise.resolve(driver);
    }),
    create: (data) => apiCall(() => {
      const newDriver = {
        ...data,
        id: Math.max(...mockDrivers.map(d => d.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      mockDrivers.push(newDriver);
      return Promise.resolve(newDriver);
    }),
    update: (id, data) => apiCall(() => {
      const index = mockDrivers.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Driver not found');
      mockDrivers[index] = { ...mockDrivers[index], ...data };
      return Promise.resolve(mockDrivers[index]);
    }),
    delete: (id) => apiCall(() => {
      const index = mockDrivers.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Driver not found');
      mockDrivers.splice(index, 1);
      return Promise.resolve(true);
    })
  };

  return {
    loading,
    error,
    parentsApi,
    studentsApi,
    driversApi
  };
};

export default useFakeApi;