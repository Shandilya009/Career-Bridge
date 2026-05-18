import { useNavigate } from 'react-router-dom';

const JobCard = ({ job, onApply, hasApplied }) => {
  const navigate = useNavigate();
  const minCGPA = job.eligibilityCriteria?.minCGPA || job.minCGPA;
  const branches = job.eligibilityCriteria?.allowedBranches || job.allowedBranches || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{job.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{job.location} · {job.jobType}</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-md border border-emerald-200">
          ₹{Number(job.package).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })} LPA
        </span>
      </div>
      <p className="text-slate-600 text-sm line-clamp-2">{job.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {minCGPA > 0 && (
          <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-medium">
            Min CGPA: {minCGPA}
          </span>
        )}
        {branches.slice(0, 3).map(b => (
          <span key={b} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            {b}
          </span>
        ))}
        {branches.length > 3 && (
          <span className="text-[10px] text-slate-400">+{branches.length - 3} more</span>
        )}
      </div>
      <p className="text-xs text-slate-400">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
      <div className="flex gap-2 mt-1">
        <button onClick={() => navigate('/jobs/' + job.id)}
          className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 text-sm hover:bg-slate-50 transition font-medium">
          Details
        </button>
        {hasApplied ? (
          <button disabled className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg py-2 text-sm font-medium cursor-not-allowed">
            ✓ Applied
          </button>
        ) : onApply && (
          <button onClick={() => onApply(job.id)}
            className="flex-1 bg-teal-700 text-white rounded-lg py-2 text-sm hover:bg-teal-800 transition font-medium">
            Apply
          </button>
        )}
      </div>
    </div>
  );
};
export default JobCard;
