import api from './axios';
export const getRecruiterProfile = ()      => api.get('/recruiter/profile');
export const getMyJobs           = ()      => api.get('/recruiter/jobs');
export const postJob             = (data)  => api.post('/recruiter/jobs', data);
export const updateJob           = (id, d) => api.put(`/recruiter/jobs/${id}`, d);
export const deleteJob           = (id)    => api.delete(`/recruiter/jobs/${id}`);
export const getApplicants       = (jobId) => api.get(`/recruiter/jobs/${jobId}/applicants`);
export const updateAppStatus     = (id, d) => api.put(`/recruiter/applications/${id}/status`, d);
export const scheduleInterview   = (data)  => api.post('/recruiter/interviews/schedule', data);
