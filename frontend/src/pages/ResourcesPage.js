import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { LocationIcon, UserIcon } from '../components/icons';
import { getAllResources } from '../api/resourceApi';
import {
  getStatusBadgeClass,
  getTypeBadgeClass,
  resourceTypeOptions,
  statusOptions,
  toStatusLabel,
  toResourceTypeLabel
} from '../utils/resourceUi';

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [capacity, setCapacity] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = {};

        if (type) {
          params.type = type;
        }
        if (status) {
          params.status = status;
        }
        if (capacity) {
          params.capacity = Number(capacity);
        }

        const data = await getAllResources(params);
        setResources(data);
      } catch (error) {
        toast.error('Failed to load resources');
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [type, status, capacity]);

  const filteredResources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return resources;
    }

    return resources.filter((resource) => {
      const name = resource.name?.toLowerCase() || '';
      const location = resource.location?.toLowerCase() || '';
      return name.includes(normalizedSearch) || location.includes(normalizedSearch);
    });
  }, [resources, searchTerm]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-[32px] font-bold leading-tight text-[#1F2937]">Facilities & Assets Catalogue</h1>
        <Link
          to="/resources/new"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#10B981] px-5 text-[14px] font-semibold text-white transition hover:bg-[#0EA271]"
        >
          + Add Resource
        </Link>
      </div>

      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search resources by name or location"
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[14px] text-[#1F2937] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
            />
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 px-3 text-[14px] text-[#1F2937] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
            >
              <option value="">All Types</option>
              {resourceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 px-3 text-[14px] text-[#1F2937] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder="Min Capacity"
              className="h-11 rounded-lg border border-slate-300 px-3 text-[14px] text-[#1F2937] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Try changing your search criteria or add a new resource."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <article key={resource.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-[20px] font-semibold leading-tight text-[#1F2937]">{resource.name}</h2>
                <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${getTypeBadgeClass(resource.type)}`}>
                  {toResourceTypeLabel(resource.type)}
                </span>
              </div>

              <div className="space-y-3 text-[14px] text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Capacity: {resource.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LocationIcon className="h-4 w-4" />
                  <span>{resource.location}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${getStatusBadgeClass(resource.status)}`}>
                  {toStatusLabel(resource.status)}
                </span>

                <Link
                  to={`/resources/${resource.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#1E3A5F] px-4 text-[14px] font-semibold text-[#1E3A5F] transition hover:bg-[#1E3A5F] hover:text-white"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourcesPage;
