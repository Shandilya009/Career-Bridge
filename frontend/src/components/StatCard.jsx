const colors = {
  teal: 'text-teal-700 bg-teal-50',
  amber: 'text-amber-600 bg-amber-50',
  sky: 'text-sky-600 bg-sky-50',
  rose: 'text-rose-600 bg-rose-50',
  slate: 'text-slate-600 bg-slate-100',
};

const StatCard = ({ label, value, icon, color = 'teal' }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg ${colors[color] || colors.teal}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-0.5">{value ?? '—'}</p>
    </div>
  </div>
);
export default StatCard;
