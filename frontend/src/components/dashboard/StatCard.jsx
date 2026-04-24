function StatCard({ title, value, accent = '#1E3A5F', icon }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-full p-2" style={{ backgroundColor: `${accent}1A`, color: accent }}>
          {icon}
        </div>
      </div>
    </article>
  );
}

export default StatCard;
