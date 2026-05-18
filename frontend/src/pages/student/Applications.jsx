import { useState, useEffect } from 'react';
import { getMyApps, withdrawApp } from '../../api/applicationsApi';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const statusBadge = {
  Applied:'bg-blue-50 text-blue-700 border-blue-200', Shortlisted:'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected:'bg-red-50 text-red-700 border-red-200', Offered:'bg-green-50 text-green-700 border-green-200',
  Withdrawn:'bg-slate-50 text-slate-500 border-slate-200', Interviewed:'bg-amber-50 text-amber-700 border-amber-200'
};

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => getMyApps().then(r => setApps(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const withdraw = async (jobId) => {
    try { await withdrawApp(jobId); toast.success('Withdrawn'); load(); }
    catch(e) { toast.error('Failed'); }
  };

  if (loading) return <Loader />;
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Applications</h1>
      {apps.length === 0 ? <p className="text-slate-500 text-sm">No applications yet. <a href="/jobs" className="text-teal-700 underline">Browse Jobs</a></p> : (
        <div className="space-y-3">
          {apps.map(({ application, job }) => (
            <div key={application.id} className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800">{job?.title || 'Job'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{job?.location} · Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadge[application.status] || ''}`}>
                  {application.status}
                </span>
                {application.status === 'Applied' && (
                  <button onClick={() => withdraw(job?.id)}
                    className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-md hover:bg-red-50 transition">Withdraw</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Applications;
