import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = () => {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
};


const getStoredToken = () => {
    try {
        return localStorage.getItem('accessToken');
    } catch (error) {
        console.warn('localStorage not available:', error);
        return null;
    }
};


const storeToken = (token, type = 'accessToken') => {
    try {
        localStorage.setItem(type, token);
    } catch (error) {
        console.warn('localStorage not available:', error);
    }
};


const clearStoredTokens = () => {
    try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    } catch (error) {
        console.warn('localStorage not available:', error);
    }
    
    
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};


api.interceptors.request.use(
    (config) => {
        console.log('=== API REQUEST DEBUG ===');
        console.log('Request URL:', config.url);
        console.log('Request method:', config.method);
        console.log('WithCredentials:', config.withCredentials);
        
        
        const storedToken = getStoredToken();
        if (storedToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${storedToken}`;
            console.log('Added Authorization header from localStorage');
        }
        
        console.log('Request headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        console.log('=== API RESPONSE DEBUG ===');
        console.log('Response status:', response.status);
        console.log('Response URL:', response.config.url);
        
        
        if (response.data?.data?.accessToken) {
            storeToken(response.data.data.accessToken, 'accessToken');
            console.log('Stored access token from response');
        }
        if (response.data?.data?.refreshToken) {
            storeToken(response.data.data.refreshToken, 'refreshToken');
            console.log('Stored refresh token from response');
        }
        
        return response;
    },
    async (error) => {
        console.log('=== API ERROR DEBUG ===');
        console.log('Error status:', error.response?.status);
        console.log('Error URL:', error.config?.url);
        console.log('Error message:', error.response?.data?.message);
        
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(() => {
                        const newToken = getStoredToken();
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                console.log('Attempting to refresh token...');
                
                
                const refreshResponse = await axios.post(
                    '/api/v1/users/refresh-token',
                    {}, 
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Token refresh successful');
                
               
                if (refreshResponse.data?.data?.accessToken) {
                    storeToken(refreshResponse.data.data.accessToken, 'accessToken');
                }
                if (refreshResponse.data?.data?.refreshToken) {
                    storeToken(refreshResponse.data.data.refreshToken, 'refreshToken');
                }
                
                
                onTokenRefreshed();
                
               
                const newToken = getStoredToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                
                return api(originalRequest);
                
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
                
                
                clearStoredTokens();
                
                
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const userAPI = {
    login: async (credentials) => {
        console.log('=== LOGIN API CALL ===');
        console.log('Login credentials:', { ...credentials, password: '[HIDDEN]' });
        
        const response = await api.post('/users/login', credentials);
        console.log('Login response received:', response.status);
        return response;
    },
    
    register: async (userData) => {
        console.log('=== REGISTER API CALL ===');
        console.log('Registration data:', { ...userData, password: '[HIDDEN]' });
        
        const response = await api.post('/users/register', userData);
        console.log('Registration response received:', response.status);
        return response;
    },
    
    logout: () => {
        console.log('=== LOGOUT API CALL ===');
        return api.post('/users/logout').finally(() => {
            clearStoredTokens();
        });
    },
    
    refreshToken: () => {
        console.log('=== REFRESH TOKEN API CALL ===');
        return api.post('/users/refresh-token');
    },
    
    getCurrentUser: () => {
        console.log('=== GET CURRENT USER API CALL ===');
        return api.get('/users/me');
    },
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