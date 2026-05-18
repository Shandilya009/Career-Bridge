import api from './axios';
export const applyForJob   = (jobId) => api.post(`/applications/apply/${jobId}`);
export const withdrawApp   = (jobId) => api.delete(`/applications/withdraw/${jobId}`);
export const getMyApps     = ()      => api.get('/applications/my');
