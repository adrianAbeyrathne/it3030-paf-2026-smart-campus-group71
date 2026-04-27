import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceFilter from '../../components/resources/ResourceFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import resourceApi from '../../api/resourceApi';

const TYPE_OPTIONS = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const STATUS_OPTIONS = ['ACTIVE', 'OUT_OF_SERVICE'];

const formatLabel = (value) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const defaultFilters = {
  search: '',
  type: '',
  status: '',
  capacity: ''
};

function ResourceListPage() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        const results = await resourceApi.searchResources({
          search: filters.search,
          type: filters.type,
          status: filters.status,
          capacity: filters.capacity ? Number(filters.capacity) : undefined
        });
        setResources(results || []);
      } catch {
        toast.error('Failed to fetch resources');
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(loadResources, 250);
    return () => clearTimeout(timeout);
  }, [filters]);

  const mappedResources = useMemo(
    () =>
      resources.map((resource) => ({
        ...resource,
        typeLabel: formatLabel(resource.type),
        statusLabel: formatLabel(resource.status)
      })),
    [resources]
  );

  const resourceSummary = useMemo(() => {
    const total = mappedResources.length;
    const active = mappedResources.filter((item) => item.status === 'ACTIVE').length;
    const maintenance = mappedResources.filter((item) => item.status === 'OUT_OF_SERVICE').length;
    const uniqueLocations = new Set(mappedResources.map((item) => item.location)).size;
    return { total, active, maintenance, uniqueLocations };
  }, [mappedResources]);

  const setFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80"
          alt="Campus resources"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081a44] via-[#0b2c63] to-[#0f766e]/70" />
        <div className="relative z-10">
          <p className="inline-block rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Campus Resource Centre
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Discover and manage campus facilities.</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Search across lecture halls, labs, and shared assets with live status, capacity, and location controls.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Facilities and Assets</h2>
        {isAdmin() && (
          <Link
            to="/resources/new"
            className="rounded-md bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            + Add Resource
          </Link>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total assets</p>
          <p className="mt-1 text-3xl font-black text-[#0b2c63]">{resourceSummary.total}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active resources</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">{resourceSummary.active}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In maintenance</p>
          <p className="mt-1 text-3xl font-black text-rose-600">{resourceSummary.maintenance}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Campus locations</p>
          <p className="mt-1 text-3xl font-black text-amber-600">{resourceSummary.uniqueLocations}</p>
        </article>
      </section>

      <ResourceFilter
        filters={filters}
        onChange={setFilter}
        onReset={() => setFilters(defaultFilters)}
        typeOptions={TYPE_OPTIONS.map((type) => ({ value: type, label: formatLabel(type) }))}
        statusOptions={STATUS_OPTIONS.map((status) => ({ value: status, label: formatLabel(status) }))}
      />

      {isLoading ? (
        <LoadingSpinner label="Loading resources..." />
      ) : mappedResources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No resources found for the selected filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mappedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceListPage;
