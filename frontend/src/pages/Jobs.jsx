import { useState, useEffect } from 'react';
import { getAllJobs } from '../api/jobsApi';
import { applyForJob, getMyApps } from '../api/applicationsApi';
import { useAuth } from '../hooks/useAuth';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => { 
    getAllJobs().then(r => { setJobs(r.data); setFiltered(r.data); }).finally(() => setLoading(false)); 
    if (user?.role === 'Student') {
      getMyApps().then(r => {
        setAppliedJobIds(new Set(r.data.map(app => app.job.id)));
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    setFiltered(jobs.filter(j =>
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, jobs]);

  const handleApply = async (jobId) => {
    try { 
      await applyForJob(jobId); 
      toast.success('Applied successfully!'); 
      setAppliedJobIds(prev => new Set([...prev, jobId]));
    }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to apply'); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Browse Jobs</h1>
        <div className="mb-6"><SearchBar value={search} onChange={setSearch} placeholder="Search by title or location..." /></div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.length === 0 ? <p className="col-span-3 text-center text-slate-500 py-16">No jobs found.</p>
              : filtered.map(j => <JobCard key={j.id} job={j} onApply={user?.role === 'Student' && !appliedJobIds.has(j.id) ? handleApply : null} hasApplied={appliedJobIds.has(j.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
};
export default Jobs;
