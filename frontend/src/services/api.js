import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        
        const refreshResponse = await api.post('/users/refresh-token');
        const newToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);


export const userAPI = {
  
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  logout: () => api.post('/users/logout'),
  refreshToken: () => api.post('/users/refresh-token'),
  getCurrentUser: () => api.get('/users/me'), 
};

export const patientAPI = {
  
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.patch('/patients/profile', data),
  
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.post('/doctors/profile', data), 
  getAvailability: (id) => api.get(`/doctors/${id}/availability`),
  
};

export const appointmentAPI = {
  
  getUserAppointments: () => api.get('/appointments'),
  
  bookAppointment: (data) => api.post('/appointments', data),
  
  editAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  
  cancelAppointment: (id) => api.delete(`/appointments/${id}`),
  
  getDoctorAppointments: (params) => api.get('/appointments/doctor', { params }),
  
  updateAppointmentStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
};

export const dashboardAPI = {
  getPatientDashboard: () => api.get('/dashboard/patient'),
  getDoctorDashboard: () => api.get('/dashboard/doctor'),
};

export default api;