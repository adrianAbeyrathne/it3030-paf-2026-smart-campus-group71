import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceFilter from '../../components/resources/ResourceFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import resourceService from '../../services/resourceService';

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
        const results = await resourceService.searchResources({
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

  const setFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Facilities & Assets</h1>
        {isAdmin() && (
          <Link
            to="/resources/new"
            className="rounded-md bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            + Add Resource
          </Link>
        )}
      </div>

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
