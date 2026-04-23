function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E3A5F]/25 border-t-[#1E3A5F]" />
    </div>
  );
}

export default LoadingSpinner;
