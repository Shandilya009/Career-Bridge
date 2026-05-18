import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getStudentProfile, updateStudentProfile, uploadResume, uploadCGPAProof } from '../../api/studentApi';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const ic = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50";

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const refreshProfile = () => getStudentProfile().then(r => { setProfile(r.data); reset(r.data); });

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    try {
      // Validate CGPA range
      const cgpa = parseFloat(data.cgpa);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        return toast.error('CGPA must be between 0.0 and 10.0');
      }
      data.cgpa = cgpa;
      data.skills = typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()).filter(s => s) : data.skills;
      await updateStudentProfile(data);
      toast.success('Profile updated!');
      refreshProfile();
    } catch(e) { toast.error(e.response?.data?.message || 'Update failed'); }
  };

  const handleResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File size must be under 5MB');
    const form = new FormData(); form.append('file', file);
    try { 
      await uploadResume(form); 
      toast.success('Resume uploaded!'); 
      refreshProfile();
    }
    catch(e) { toast.error(e.response?.data || 'Upload failed'); }
  };

  const handleCGPAProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File size must be under 5MB');
    const form = new FormData(); form.append('file', file);
    try { 
      await uploadCGPAProof(form); 
      toast.success('CGPA Proof uploaded! It will be reviewed by the admin.'); 
      refreshProfile();
    }
    catch(e) { toast.error(e.response?.data || 'Upload failed'); }
  };

  if (loading) return <Loader />;
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-slate-700">First Name</label>
            <input {...register('firstName')} className={ic + " mt-1"} required /></div>
          <div><label className="text-sm font-medium text-slate-700">Last Name</label>
            <input {...register('lastName')} className={ic + " mt-1"} required /></div>
        </div>
        <div><label className="text-sm font-medium text-slate-700">Department</label>
          <input {...register('department')} className={ic + " mt-1"} required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">CGPA <span className="text-slate-400 font-normal">(0 - 10)</span></label>
            <input {...register('cgpa')} type="number" step="0.01" min="0" max="10" className={ic + " mt-1"} required />
          </div>
          <div><label className="text-sm font-medium text-slate-700">Grad Year</label>
            <input {...register('graduationYear')} type="number" min="2020" max="2035" className={ic + " mt-1"} required /></div>
        </div>
        <div><label className="text-sm font-medium text-slate-700">Skills <span className="text-slate-400 font-normal">(comma separated)</span></label>
          <input {...register('skills')} className={ic + " mt-1"} placeholder="React, Node.js, Python..." /></div>
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-teal-700 text-white py-2.5 rounded-lg hover:bg-teal-800 transition text-sm font-medium disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Document Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Resume */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-700 text-sm mb-3">📄 Upload Resume (PDF)</h2>
          {profile?.resumeUrl ? (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-emerald-600 font-medium">✓ Resume uploaded</span>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}${profile.resumeUrl}`} target="_blank" rel="noreferrer"
                className="text-xs text-teal-700 underline">View</a>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mb-3">No resume uploaded yet</p>
          )}
          <input type="file" accept=".pdf" onChange={handleResume}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 file:cursor-pointer" />
          <p className="text-xs text-slate-400 mt-2">PDF only, max 5MB</p>
        </div>

        {/* CGPA Proof */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-700 text-sm mb-3">🎓 Upload CGPA Proof</h2>
          {profile?.cgpaProofUrl ? (
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${profile.isCGPAVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {profile.isCGPAVerified ? '✓ CGPA Verified by Admin' : '⌛ Pending Admin Verification'}
                </span>
                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}${profile.cgpaProofUrl}`} target="_blank" rel="noreferrer"
                  className="text-xs text-teal-700 underline">View</a>
              </div>
              {profile.isCGPAVerified && profile.cgpaVerifiedAt && (
                <p className="text-[10px] text-slate-400 mt-1">Verified on {new Date(profile.cgpaVerifiedAt).toLocaleDateString()}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mb-3">Upload your marksheet or transcript for CGPA verification</p>
          )}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCGPAProof}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 file:cursor-pointer" />
          <p className="text-xs text-slate-400 mt-2">PDF or Image, max 5MB</p>
        </div>
      </div>
    </div>
  );
};
export default StudentProfile;
