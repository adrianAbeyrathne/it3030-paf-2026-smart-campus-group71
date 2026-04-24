function ResourceFilter({ filters, onChange, onReset, typeOptions, statusOptions }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label htmlFor="search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Name, location, description"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-[#1E3A5F]/20 focus:ring"
          />
        </div>

        <div>
          <label htmlFor="type" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(event) => onChange('type', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-[#1E3A5F]/20 focus:ring"
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-[#1E3A5F]/20 focus:ring"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="minCapacity" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Min Capacity
          </label>
          <input
            id="minCapacity"
            type="number"
            min="1"
            value={filters.capacity}
            onChange={(event) => onChange('capacity', event.target.value)}
            placeholder="e.g. 50"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-[#1E3A5F]/20 focus:ring"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResourceFilter;
