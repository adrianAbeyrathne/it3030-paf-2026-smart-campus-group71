function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center">
      <div className="flex items-center gap-3 text-slate-600">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1E3A5F]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
