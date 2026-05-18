import { useState, useEffect } from 'react';
import { getAdminDashboard, getAdminStudents, getAdminRecruiters, approveRecruiter, rejectRecruiter, sendAnnouncement, verifyCGPA, getPendingCGPAVerifications, rejectStudentResume } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import SearchBar from '../../components/SearchBar';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:5001';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [pendingCGPAs, setPendingCGPAs] = useState([]);
  const [tab, setTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const { register, handleSubmit, reset, formState:{isSubmitting} } = useForm();

  const refreshAll = () => Promise.all([
    getAdminDashboard().then(r => setStats(r.data)),
    getAdminStudents().then(r => setStudents(r.data)),
    getAdminRecruiters().then(r => setRecruiters(r.data)),
    getPendingCGPAVerifications().then(r => setPendingCGPAs(r.data)),
  ]);

  useEffect(() => {
    refreshAll()
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const onApprove = async (id) => {
    try { await approveRecruiter(id); toast.success('Recruiter Approved'); refreshAll(); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to approve'); }
  };
  const onReject = async (id) => {
    const confirm = window.confirm("Are you sure you want to reject/revoke access for this recruiter?");
    if (!confirm) return;
    try { await rejectRecruiter(id); toast.success('Recruiter Rejected'); refreshAll(); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to reject'); }
  };

  const onVerifyCGPA = async (id, approved) => {
    const reason = approved ? '' : window.prompt('Rejection reason (optional):') || 'Document not acceptable';
    if (!approved && !reason) return; // User cancelled prompt
    try {
      await verifyCGPA(id, { approved, reason });
      toast.success(approved ? 'CGPA Verified ✓' : 'CGPA Rejected');
      refreshAll();
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to update CGPA verification'); }
  };

  const onRejectCV = async (id) => {
    if (!window.confirm("Are you sure you want to reject this student's CV? It will be deleted and they will be asked to upload a new one.")) return;
    try {
      await rejectStudentResume(id);
      toast.success('CV Rejected Successfully');
      refreshAll();
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to reject CV'); }
  };

  const onAnnounce = async (data) => {
    try { await sendAnnouncement(data); toast.success('Announcement sent!'); setShowAnnounce(false); reset(); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to send'); }
  };

  const chartData = stats ? [
    { name: 'Students', count: stats.totalStudents },
    { name: 'Recruiters', count: stats.totalRecruiters },
    { name: 'Jobs', count: stats.totalJobs },
    { name: 'Applications', count: stats.totalApplications },
  ] : [];

  if (loading) return <Loader />;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <button onClick={() => setShowAnnounce(true)}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition text-sm font-medium">Send Announcement</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Students"     value={stats?.totalStudents}     icon="🎓" color="teal" />
        <StatCard label="Recruiters"   value={stats?.totalRecruiters}   icon="🏢" color="sky" />
        <StatCard label="Jobs"         value={stats?.totalJobs}         icon="💼" color="amber" />
        <StatCard label="Applications" value={stats?.totalApplications} icon="📋" color="rose" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold text-slate-700 text-sm mb-4">Platform Overview</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}><XAxis dataKey="name" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} /><Tooltip />
            <Bar dataKey="count" fill="#0f766e" radius={[4,4,0,0]} /></BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {['overview','students','recruiters','cgpa verifications'].map(t => (
            <button key={t} onClick={() => { setTab(t); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${tab===t ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {t}{t === 'cgpa verifications' && pendingCGPAs.length > 0 ? ` (${pendingCGPAs.length})` : ''}
            </button>
          ))}
        </div>
        {tab !== 'overview' && (
          <div className="w-full md:w-64">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={`Search ${tab}...`} />
          </div>
        )}
      </div>

      {/* Students Tab */}
      {tab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">CGPA</th>
              <th className="px-4 py-3 text-left">CGPA Status</th>
              <th className="px-4 py-3 text-left">Documents</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead><tbody>
            {students.filter(s => (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || s.department.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-3 text-slate-500">{s.department}</td>
                <td className="px-4 py-3 font-medium">{s.cgpa}</td>
                <td className="px-4 py-3">
                  {s.isCGPAVerified
                    ? <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded">✓ Verified</span>
                    : s.cgpaProofUrl
                      ? <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded">⌛ Pending</span>
                      : <span className="text-slate-400 font-medium text-xs bg-slate-50 px-2 py-1 rounded">No Proof</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {s.resumeUrl && (
                      <a href={`${API_BASE}${s.resumeUrl}`} target="_blank" rel="noreferrer"
                        className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-200 transition">📄 CV</a>
                    )}
                    {s.cgpaProofUrl && (
                      <a href={`${API_BASE}${s.cgpaProofUrl}`} target="_blank" rel="noreferrer"
                        className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-200 transition">🎓 Proof</a>
                    )}
                    {!s.resumeUrl && !s.cgpaProofUrl && (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {s.resumeUrl && (
                      <button onClick={() => onRejectCV(s.id)}
                        className="text-[10px] border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition uppercase font-medium">Reject CV</button>
                    )}
                    {!s.isCGPAVerified && s.cgpaProofUrl && (
                      <>
                        <button onClick={() => onVerifyCGPA(s.id, true)}
                          className="text-[10px] bg-teal-700 text-white px-2 py-1 rounded hover:bg-teal-800 transition uppercase font-medium">✓ Verify CGPA</button>
                        <button onClick={() => onVerifyCGPA(s.id, false)}
                          className="text-[10px] border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition uppercase font-medium">✗ Reject CGPA</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-sm">No students registered yet</td></tr>
            )}
          </tbody></table>
        </div>
      )}

      {/* Recruiters Tab */}
      {tab === 'recruiters' && (
        <div className="space-y-3">
          {recruiters.filter(r => r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || r.industry.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">{r.companyName}</p>
                <p className="text-xs text-slate-500">{r.industry} · {r.contactPerson}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${r.isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {r.isApproved ? 'Approved' : 'Pending'}
                </span>
                {!r.isApproved ? (
                  <>
                    <button onClick={() => onApprove(r.id)} className="text-xs bg-teal-700 text-white px-3 py-1 rounded-md hover:bg-teal-800 transition">Approve</button>
                    <button onClick={() => onReject(r.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition">Reject</button>
                  </>
                ) : (
                  <button onClick={() => onReject(r.id)} className="text-xs border border-red-200 text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition">Revoke Access</button>
                )}
              </div>
            </div>
          ))}
          {recruiters.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No recruiters registered yet</p>}
        </div>
      )}

      {/* CGPA Verifications Tab */}
      {tab === 'cgpa verifications' && (
        <div className="space-y-3">
          {pendingCGPAs.filter(s => (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-400 text-sm">🎉 No pending CGPA verifications</p>
            </div>
          ) : (
            pendingCGPAs.filter(s => (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-slate-500">CGPA: <strong>{s.cgpa}</strong> · {s.department} · Year: {s.graduationYear}</p>
                  <div className="flex gap-3 mt-2">
                    {s.cgpaProofUrl && (
                      <a href={`${API_BASE}${s.cgpaProofUrl}`} target="_blank" rel="noreferrer"
                        className="text-xs text-teal-600 hover:underline font-medium">📎 View CGPA Proof</a>
                    )}
                    {s.resumeUrl && (
                      <a href={`${API_BASE}${s.resumeUrl}`} target="_blank" rel="noreferrer"
                        className="text-xs text-slate-500 hover:underline">📄 View Resume</a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onVerifyCGPA(s.id, true)} className="text-xs bg-teal-700 text-white px-3 py-1.5 rounded-md hover:bg-teal-800 transition font-medium">✓ Approve</button>
                  <button onClick={() => onVerifyCGPA(s.id, false)} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition font-medium">✗ Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Announcement Modal */}
      <Modal open={showAnnounce} onClose={() => setShowAnnounce(false)} title="Send Announcement">
        <form onSubmit={handleSubmit(onAnnounce)} className="space-y-3">
          <input {...register('title')} placeholder="Title" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50" required />
          <textarea {...register('content')} placeholder="Message..." rows={4} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50" required />
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-teal-700 text-white py-2.5 rounded-lg hover:bg-teal-800 transition text-sm font-medium">Send</button>
        </form>
      </Modal>
    </div>
  );
};
export default AdminDashboard;
