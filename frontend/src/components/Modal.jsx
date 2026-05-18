const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 border border-slate-200 relative">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg">✕</button>
        {title && <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
export default Modal;
