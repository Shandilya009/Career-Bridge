import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { setCredentials } from '../features/authSlice';
import toast from 'react-hot-toast';

const schema = yup.object({ email: yup.string().email().required(), password: yup.string().min(6).required() });

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await loginApi(data);
      dispatch(setCredentials(res.data));
      toast.success('Welcome back, ' + res.data.name + '!');
      const path = res.data.role === 'Admin' ? '/admin/dashboard'
        : res.data.role === 'Recruiter' ? '/recruiter/dashboard' : '/student/dashboard';
      navigate(path);
    } catch (e) { toast.error(e.response?.data?.message || 'Login failed'); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,118,110,0.15),transparent_50%)]" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-10 border border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">CB</div>
          <h1 className="text-2xl font-bold text-slate-800">CareerBridge</h1>
        </div>
        <p className="text-center text-slate-500 text-sm mb-8">Sign in to continue</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input {...register('email')} type="email" placeholder="you@university.edu"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input {...register('password')} type="password" placeholder="Enter your password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-50">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            New here? <Link to="/register" className="text-teal-700 font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;

