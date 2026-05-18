import { Link } from 'react-router-dom';
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-50">
    <h1 className="text-6xl font-extrabold text-slate-300 mb-4">404</h1>
    <p className="text-lg text-slate-600 mb-6">Page not found.</p>
    <Link to="/" className="bg-teal-700 text-white px-6 py-2.5 rounded-lg hover:bg-teal-800 transition text-sm font-medium">Go Home</Link>
  </div>
);
export default NotFound;
