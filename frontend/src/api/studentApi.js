import api from './axios';
export const getStudentProfile    = ()     => api.get('/student/profile');
export const updateStudentProfile = (data) => api.put('/student/profile', data);
export const getStudentDashboard  = ()     => api.get('/student/dashboard');
export const uploadResume         = (form) => api.post('/student/resume/upload', form,
  { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadCGPAProof      = (form) => api.post('/student/cgpa-proof/upload', form,
  { headers: { 'Content-Type': 'multipart/form-data' } });
