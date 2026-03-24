import api from './axios';

export const getStats = () => api.get('/dashboard/stats');
export const getTrends = () => api.get('/dashboard/trends');
export const getLowStock = () => api.get('/dashboard/low-stock');
export const getCategoryBreakdown = () => api.get('/dashboard/category-breakdown');
