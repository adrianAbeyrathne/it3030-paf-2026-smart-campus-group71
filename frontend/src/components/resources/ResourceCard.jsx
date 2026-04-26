import { Link } from 'react-router-dom';

const statusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100', // Occupied
  NOT_ACTIVE: 'bg-blue-50 text-blue-600 border-blue-100', // Available
  OUT_OF_SERVICE: 'bg-rose-50 text-rose-600 border-rose-100' // Red for Maintenance
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[resource.status] || 'bg-slate-200 text-slate-700'}`}>
          {resource.statusLabel}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/resources/${resource.id}`}
            className="rounded-md bg-[#1E3A5F] px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ResourceCard;
