import api from './axios';

export const stockIn = (data) => api.post('/stock/in', data);
export const stockOut = (data) => api.post('/stock/out', data);
export const adjustStock = (data) => api.post('/stock/adjust', data);
export const getMovements = (params) => api.get('/stock/movements', { params });
export const getProductMovements = (productId) => api.get('/stock/movements', { params: { product_id: productId } });
