export default function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 mt-1 font-medium animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
