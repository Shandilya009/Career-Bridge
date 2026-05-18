import api from './axios';
export const getAllJobs    = (params) => api.get('/jobs', { params });
export const getJobById   = (id)     => api.get(`/jobs/${id}`);
export const searchJobs   = (params) => api.get('/jobs/search', { params });
