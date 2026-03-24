import api from './axios';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const updateProfile = (userData) => api.put('/auth/profile', userData);
export const updatePassword = (passwords) => api.put('/auth/password', passwords);

