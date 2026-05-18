import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../api/jobsApi';
import { applyForJob, getMyApps } from '../api/applicationsApi';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getJobById(id).then(r => setJob(r.data)).finally(() => setLoading(false));
    if (user?.role === 'Student') {
      getMyApps().then(r => {
        setHasApplied(r.data.some(app => app.job.id === id));
      }).catch(console.error);
    }
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    try { 
      await applyForJob(id); 
      toast.success('Applied successfully! 🎉'); 
      setHasApplied(true);
    }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  // Handle both nested and flat eligibility fields
  const minCGPA = job?.eligibilityCriteria?.minCGPA ?? job?.minCGPA ?? 0;
  const branches = job?.eligibilityCriteria?.allowedBranches ?? job?.allowedBranches ?? [];
  const gradYear = job?.eligibilityCriteria?.graduationYear ?? job?.graduationYear;

  if (loading) return <><Navbar /><Loader /></>;
  if (!job) return <><Navbar /><p className="text-center mt-20 text-slate-500">Job not found.</p></>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 mb-4 transition">← Back</button>
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{job.title}</h1>
              <p className="text-slate-500 text-sm">{job.location} · {job.jobType}</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-lg border border-emerald-200">
              ₹{Number(job.package).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} LPA
            </span>
          </div>

          <div className="border-t border-slate-100 pt-5 mb-6">
            <h2 className="font-semibold text-slate-700 text-sm mb-2">Job Description</h2>
            <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>

          <div className="border-t border-slate-100 pt-5 mb-6">
            <h2 className="font-semibold text-slate-700 text-sm mb-3">Eligibility Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Min CGPA</p>
                <p className="text-lg font-bold text-slate-800">{minCGPA || 'N/A'} <span className="text-xs text-slate-400 font-normal">/ 10</span></p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Branches</p>
                <p className="text-sm font-medium text-slate-800">{branches.length > 0 ? branches.join(', ') : 'All branches'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Graduation Year</p>
                <p className="text-sm font-medium text-slate-800">{gradYear || 'Any year'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <p className="text-red-500 text-xs font-medium">⏰ Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            {job.isActive === false && <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200">Closed</span>}
          </div>

          {user?.role === 'Student' && job.isActive !== false && (
            hasApplied ? (
              <button disabled className="w-full mt-6 bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-lg text-sm font-semibold cursor-not-allowed">
                ✓ Already Applied
              </button>
            ) : (
              <button onClick={handleApply} disabled={applying}
                className="w-full mt-6 bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition text-sm font-semibold disabled:opacity-50">
                {applying ? 'Applying...' : 'Apply Now →'}
              </button>
            )
          )}
          {!user && (
            <p className="text-center text-sm text-slate-500 mt-6">
              <a href="/login" className="text-teal-700 font-medium hover:underline">Login as Student</a> to apply
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default JobDetail;
