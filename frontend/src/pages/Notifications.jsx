import { useState, useEffect } from 'react';
import { getNotifications, markRead } from '../api/notificationsApi';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => getNotifications().then(r => setNotifs(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const handleRead = async (id) => { await markRead(id); load(); };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Notifications</h1>
        {loading ? <Loader /> : notifs.length === 0 ? <p className="text-slate-500 text-sm">No notifications.</p> : (
          <div className="space-y-3">
            {notifs.map(n => (
              <div key={n.id} className={`bg-white rounded-xl border p-5 ${n.isRead ? 'border-slate-100' : 'border-l-4 border-l-teal-600 border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-medium text-sm ${n.isRead ? 'text-slate-400' : 'text-slate-800'}`}>{n.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => handleRead(n.id)} className="text-xs text-teal-700 hover:underline ml-4 shrink-0">Mark Read</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Notifications;
