import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudentApi, registerRecruiterApi } from '../api/authApi';
import toast from 'react-hot-toast';

const studentSchema = yup.object({
  email: yup.string().email().required(), password: yup.string().min(6).required(),
  firstName: yup.string().required(), lastName: yup.string().required(),
  department: yup.string().required(), graduationYear: yup.number().min(2020).required(),
});
const recruiterSchema = yup.object({
  email: yup.string().email().required(), password: yup.string().min(6).required(),
  companyName: yup.string().required(), contactPerson: yup.string().required(),
  industry: yup.string().required(),
});

const ic = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50";

const Register = () => {
  const [role, setRole] = useState('Student');
  const navigate = useNavigate();
  const schema = role === 'Student' ? studentSchema : recruiterSchema;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      if (role === 'Student') await registerStudentApi(data);
      else await registerRecruiterApi(data);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (e) { toast.error(e.response?.data?.message || 'Registration failed'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(15,118,110,0.12),transparent_50%)]" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-10 border border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">CB</div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
        </div>
        <p className="text-center text-slate-500 text-sm mb-6">Join CareerBridge today</p>
        <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
          {['Student', 'Recruiter'].map(r => (
            <button key={r} onClick={() => { setRole(r); reset(); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${role === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {r}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('email')} placeholder="Email" type="email" className={ic} />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          <input {...register('password')} placeholder="Password (min 6 chars)" type="password" className={ic} />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          {role === 'Student' ? (<>
            <div className="grid grid-cols-2 gap-3">
              <input {...register('firstName')} placeholder="First Name" className={ic} />
              <input {...register('lastName')}  placeholder="Last Name"  className={ic} />
            </div>
            <input {...register('department')} placeholder="Department (e.g. CSE)" className={ic} />
            <input {...register('graduationYear')} type="number" placeholder="Graduation Year" className={ic} />
          </>) : (<>
            <input {...register('companyName')}   placeholder="Company Name"    className={ic} />
            <input {...register('contactPerson')} placeholder="Contact Person"  className={ic} />
            <input {...register('industry')}      placeholder="Industry"        className={ic} />
          </>)}
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-teal-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;
