import { useState, useEffect } from 'react';
import { getStudentDashboard } from '../../api/studentApi';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getStudentDashboard().then(r => setData(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <Loader />;
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Welcome back, {data?.student?.firstName}
      </h1>
      <p className="text-slate-500 text-sm mb-8">{data?.student?.department} · Class of {data?.student?.graduationYear}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Applications" value={data?.totalApplications} icon="📋" color="teal" />
        <StatCard label="Interviews"   value={data?.interviews}        icon="🎯" color="amber" />
        <StatCard label="CGPA"         value={data?.student?.cgpa}     icon="🎓" color="sky" />
      </div>
      <div className="flex gap-3">
        <Link to="/jobs" className="bg-teal-700 text-white px-5 py-2.5 rounded-lg hover:bg-teal-800 transition text-sm font-medium">Browse Jobs</Link>
        <Link to="/student/applications" className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition text-sm font-medium">My Applications</Link>
      </div>
    </div>
  );
};
export default StudentDashboard;
