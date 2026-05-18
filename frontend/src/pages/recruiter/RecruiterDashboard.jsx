import { useState, useEffect } from 'react';
import { getMyJobs, deleteJob, getApplicants, updateAppStatus } from '../../api/recruiterApi';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import SearchBar from '../../components/SearchBar';
import PostJobForm from './PostJobForm';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('');

  const load = () => getMyJobs().then(r => setJobs(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try { await deleteJob(id); toast.success('Deleted'); load(); } catch(e) { toast.error('Failed'); }
  };

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    setApplicantSearchQuery('');
    const r = await getApplicants(job.id);
    setApplicants(r.data);
  };

  const changeStatus = async (appId, status) => {
    try { await updateAppStatus(appId, { status }); toast.success('Updated'); viewApplicants(selectedJob); }
    catch(e) { toast.error('Failed'); }
  };

  if (loading) return <Loader />;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Recruiter Dashboard</h1>
        <button onClick={() => setShowPostJob(true)}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition text-sm font-medium">+ Post Job</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Posted Jobs" value={jobs.length} icon="💼" color="teal" />
        <StatCard label="Active"      value={jobs.filter(j=>j.isActive).length} icon="✅" color="sky" />
        <StatCard label="Closed"      value={jobs.filter(j=>!j.isActive).length} icon="🔒" color="slate" />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold text-slate-700">Job Postings</h2>
        <div className="w-full md:w-64">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search jobs..." />
        </div>
      </div>
      <div className="space-y-3">
        {jobs.length === 0 ? <p className="text-slate-500 text-sm">No jobs posted yet.</p> :
          jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.location.toLowerCase().includes(searchQuery.toLowerCase())).map(j => (
            <div key={j.id} className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800">{j.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{j.location} · ₹{Number(j.package).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} LPA</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewApplicants(j)}
                  className="text-sm border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition">Applicants</button>
                <button onClick={() => handleDelete(j.id)}
                  className="text-sm border border-red-200 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition">Delete</button>
              </div>
            </div>
          ))}
      </div>
      <Modal open={showPostJob} onClose={() => { setShowPostJob(false); load(); }} title="Post a New Job">
        <PostJobForm onSuccess={() => { setShowPostJob(false); load(); }} />
      </Modal>
      <Modal open={!!selectedJob} onClose={() => { setSelectedJob(null); setApplicants([]); }} title={'Applicants — ' + (selectedJob?.title || '')}>
        <div className="mb-4">
          <SearchBar value={applicantSearchQuery} onChange={setApplicantSearchQuery} placeholder="Search by name or dept..." />
        </div>
        {applicants.length === 0 ? <p className="text-slate-500 text-sm">No applicants yet.</p> : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {applicants.filter(a => (a.student?.firstName + ' ' + a.student?.lastName).toLowerCase().includes(applicantSearchQuery.toLowerCase()) || a.student?.department.toLowerCase().includes(applicantSearchQuery.toLowerCase())).map(({ application, student }) => (
              <div key={application.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800 flex items-center gap-2">
                      {student?.firstName} {student?.lastName}
                      {student?.isCGPAVerified && <span title="CGPA Verified" className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">Verified CGPA</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{student?.department} · CGPA: {student?.cgpa}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {student?.resumeUrl && (
                      <a href={(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001') + student.resumeUrl} target="_blank" rel="noreferrer" 
                        className="text-xs text-teal-700 bg-teal-50 px-3 py-1 rounded hover:bg-teal-100 transition font-medium whitespace-nowrap">📄 View CV</a>
                    )}
                    {student?.cgpaProofUrl && (
                      <a href={(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001') + student.cgpaProofUrl} target="_blank" rel="noreferrer" 
                        className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded hover:bg-slate-100 transition font-medium whitespace-nowrap">🎓 CGPA Proof</a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                  <span className="text-xs font-medium text-slate-500 self-center mr-1">Set Status:</span>
                  {['Shortlisted','Interviewed','Offered','Rejected'].map(s => (
                    <button key={s} onClick={() => changeStatus(application.id, s)}
                      className="text-xs px-3 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition">{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default RecruiterDashboard;
