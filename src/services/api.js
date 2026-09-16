import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle error response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Admin APIs
export const adminAPI = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getPendingUsers: () => api.get('/admin/users/pending'),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  rejectUser: (id) => api.put(`/admin/users/${id}/reject`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetPassword: (id, data) => api.put(`/admin/users/${id}/reset-password`, data),

  // Vehicles
  getVehicles: (params) => api.get('/admin/vehicles', { params }),
  createVehicle: (data) => api.post('/admin/vehicles', data),
  updateVehicle: (id, data) => api.put(`/admin/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/admin/vehicles/${id}`),

  // Checklist & Forms
  getForms: () => api.get('/admin/forms'),
  getFormCategories: (typeKey) => api.get(`/admin/forms/${typeKey}/categories`),
  createFormType: (data) => api.post('/admin/forms', data),
  updateFormType: (id, data) => api.put(`/admin/forms/${id}`, data),
  deleteFormType: (id) => api.delete(`/admin/forms/${id}`),
  addCategory: (typeKey, data) => api.post(`/admin/forms/${typeKey}/categories`, data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  addItem: (categoryId, data) => api.post(`/admin/categories/${categoryId}/items`, data),
  updateItem: (id, data) => api.put(`/admin/items/${id}`, data),
  toggleItem: (id) => api.put(`/admin/items/${id}/toggle`),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
  reorderItem: (id, data) => api.put(`/admin/items/${id}/reorder`, data),

  // Inspections
  getInspections: (params) => api.get('/admin/inspections', { params }),
  getInspectionDetail: (id) => api.get(`/admin/inspections/${id}`),
  acknowledgeInspection: (id) => api.put(`/admin/inspections/${id}/acknowledge`),
  getPrintData: (id) => api.get(`/admin/inspections/${id}/print`),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  markAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllAsRead: () => api.put('/admin/notifications/read-all'),

  // Reports
  getReports: (params) => api.get('/admin/reports', { params }),
};

// Master Data APIs (Admin only)
export const masterDataAPI = {
  // Vehicle Models
  getVehicleModels: () => api.get('/master-data/vehicle-models'),
  createVehicleModel: (data) => api.post('/master-data/vehicle-models', data),
  updateVehicleModel: (id, data) => api.put(`/master-data/vehicle-models/${id}`, data),
  deleteVehicleModel: (id) => api.delete(`/master-data/vehicle-models/${id}`),
  
  // Departments  
  getDepartments: () => api.get('/master-data/departments'),
  createDepartment: (data) => api.post('/master-data/departments', data),
  updateDepartment: (id, data) => api.put(`/master-data/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/master-data/departments/${id}`),
  
  // Work Locations
  getWorkLocations: () => api.get('/master-data/work-locations'),
  createWorkLocation: (data) => api.post('/master-data/work-locations', data),
  updateWorkLocation: (id, data) => api.put(`/master-data/work-locations/${id}`, data),
  deleteWorkLocation: (id) => api.delete(`/master-data/work-locations/${id}`),
  
  // Asset Statuses
  getAssetStatuses: () => api.get('/master-data/asset-statuses'),
  createAssetStatus: (data) => api.post('/master-data/asset-statuses', data),
  updateAssetStatus: (id, data) => api.put(`/master-data/asset-statuses/${id}`, data),
  deleteAssetStatus: (id) => api.delete(`/master-data/asset-statuses/${id}`),
};

// Operator APIs (authenticated - legacy, still works if needed)
export const operatorAPI = {
  getVehicles: () => api.get('/operator/vehicles'),
  getTodayStatus: () => api.get('/operator/today-status'),
  getFormChecklist: (typeKey) => api.get(`/operator/forms/${typeKey}`),
  getInspections: () => api.get('/operator/inspections'),
  getInspectionDetail: (id) => api.get(`/operator/inspections/${id}`),
  submitInspection: (data) => api.post('/operator/inspections', data),
};

// Public Operator APIs (TANPA AUTH — akses via link langsung)
// Untuk bapak-bapak operator gaptek yang tidak perlu login
const publicApi = axios.create({
  baseURL: API_URL.replace('/api', '/api/public'),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicAPI = {
  getVehicles: () => publicApi.get('/vehicles'),
  getFormTypes: () => publicApi.get('/form-types'),
  getFormChecklist: (typeKey) => publicApi.get(`/forms/${typeKey}`),
  submitInspection: (data) => publicApi.post('/inspections', data),
  // Master Data (PUBLIC - for operator dropdown auto-fill)
  getDepartments: () => publicApi.get('/master-data/departments'),
  getWorkLocations: () => publicApi.get('/master-data/work-locations'),
  getAssetStatuses: () => publicApi.get('/master-data/asset-statuses'),
  getVehicleModels: () => publicApi.get('/master-data/vehicle-models'),
};

export default api;
