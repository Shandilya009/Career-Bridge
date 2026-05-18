import api from './axios';
export const loginApi        = (data) => api.post('/auth/login', data);
export const registerStudentApi   = (data) => api.post('/auth/register/student', data);
export const registerRecruiterApi = (data) => api.post('/auth/register/recruiter', data);
