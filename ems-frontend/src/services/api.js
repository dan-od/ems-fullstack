import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    }
    
    // Log detailed error information for debugging
    if (error.response?.status === 500) {
      console.error('Server Error Details:', {
        endpoint: error.config.url,
        method: error.config.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.config.headers
      });
    }
    
    return Promise.reject(error);
  }
);

// Equipment API Methods with improved error handling
export const equipmentService = {
  getAll: (params = {}) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  getStats: () => api.get('/equipment/stats'),
  
  // Updated maintenance methods with better error handling
  getMaintenanceLogs: async (id) => {
    try {
      return await api.get(`/equipment/${id}/maintenance`);
    } catch (error) {
      console.error(`Error fetching maintenance logs for equipment ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  addMaintenanceLog: async (id, data) => {
    try {
      // Format data to match what the backend expects
      const formattedData = {
        maintenance_type: data.maintenance_type,
        description: data.description,
        date: data.date
      };
      
      console.log('Sending maintenance log data:', formattedData);
      return await api.post(`/equipment/${id}/maintenance`, formattedData);
    } catch (error) {
      console.error(`Error adding maintenance log for equipment ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

// User service methods
export const userService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Maintenance service with improved error handling
export const maintenanceService = {
  getLogs: async () => {
    try {
      return await api.get('/maintenance');
    } catch (error) {
      console.error('Error fetching maintenance logs:', error.response?.data || error.message);
      throw error;
    }
  },
  createLog: async (data) => {
    try {
      return await api.post('/maintenance', data);
    } catch (error) {
      console.error('Error creating maintenance log:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default api;