import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const dashPath = user?.role === 'Admin' ? '/admin/dashboard'
    : user?.role === 'Recruiter' ? '/recruiter/dashboard' : '/student/dashboard';

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-teal-700 rounded-md flex items-center justify-center text-white font-bold text-xs">CB</div>
        <span className="text-lg font-semibold text-slate-800">CareerBridge</span>
      </Link>
      <div className="flex items-center gap-5 text-sm">
        {isAuthenticated ? (<>
          <Link to={dashPath} className="text-slate-600 hover:text-slate-900 transition font-medium">Dashboard</Link>
          {user?.role === 'Student' && (
            <Link to="/student/profile" className="text-slate-600 hover:text-slate-900 transition font-medium">Update CV & CGPA</Link>
          )}
          <Link to="/jobs" className="text-slate-600 hover:text-slate-900 transition font-medium">Jobs</Link>
          <Link to="/notifications" className="text-slate-600 hover:text-slate-900 transition font-medium">Notifications</Link>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 text-xs">{user?.name}</span>
          <button onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition">Logout</button>
        </>) : (<>
          <Link to="/login" className="text-slate-600 hover:text-slate-900 transition font-medium">Login</Link>
          <Link to="/register" className="bg-teal-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-800 transition">Register</Link>
        </>)}
      </div>
    </nav>
  );
};
export default Navbar;
