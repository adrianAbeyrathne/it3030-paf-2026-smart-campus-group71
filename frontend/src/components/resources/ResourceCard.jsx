import { Link } from 'react-router-dom';

const statusStyles = {
  ACTIVE: 'bg-[#10B981]/15 text-[#047857]',
  OUT_OF_SERVICE: 'bg-[#EF4444]/15 text-[#B91C1C]'
};

function ResourceCard({ resource }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{resource.name}</h3>
        <span className="rounded-full bg-[#1E3A5F]/10 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F]">{resource.typeLabel}</span>
      </div>

      <p className="mt-2 text-sm text-slate-600">{resource.description || 'No description available.'}</p>

      <dl className="mt-4 space-y-2 text-sm text-slate-700">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Capacity</dt>
          <dd className="font-medium">{resource.capacity}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Location</dt>
          <dd className="font-medium">{resource.location}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[resource.status] || 'bg-slate-200 text-slate-700'}`}>
          {resource.statusLabel}
        </span>
        <Link
          to={`/resources/${resource.id}`}
          className="rounded-md bg-[#1E3A5F] px-3 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ResourceCard;
