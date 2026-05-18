import { Link } from 'react-router-dom';
const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-50">
    <h1 className="text-6xl font-extrabold text-red-500 mb-4">403</h1>
    <p className="text-lg text-slate-600 mb-6">You are not authorized to view this page.</p>
    <Link to="/" className="bg-teal-700 text-white px-6 py-2.5 rounded-lg hover:bg-teal-800 transition text-sm font-medium">Go Home</Link>
  </div>
);
export default Unauthorized;
