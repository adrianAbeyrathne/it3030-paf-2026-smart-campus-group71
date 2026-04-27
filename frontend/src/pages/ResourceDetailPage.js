import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { LocationIcon, UserIcon } from '../components/icons';
import { deleteResource, getResourceById } from '../api/resourceApi';
import {
  getStatusBadgeClass,
  toResourceTypeLabel,
  toStatusLabel
} from '../utils/resourceUi';

function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const loadResource = async () => {
      setLoading(true);
      try {
        const data = await getResourceById(id);
        setResource(data);
      } catch (error) {
        setResource(null);
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id]);

  const onDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this resource?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteResource(id);
      toast.success('Resource deleted successfully');
      navigate('/resources');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!resource) {
    return (
      <EmptyState
        title="Resource not found"
        description="The requested resource does not exist or could not be loaded."
      />
    );
  }

  return (
    <div>
      <Link to="/resources" className="inline-block text-[14px] font-semibold text-[#1E3A5F] hover:underline">
        ← Back to Catalogue
      </Link>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[32px] font-bold leading-tight text-[#1F2937]">{resource.name}</h1>
            <p className="mt-3 text-[14px] text-[#6B7280]">
              {resource.description || 'No description provided for this resource.'}
            </p>
          </div>

          <span className={`w-fit rounded-full px-4 py-2 text-[12px] font-semibold ${getStatusBadgeClass(resource.status)}`}>
            {toStatusLabel(resource.status)}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-6">
            <h2 className="mb-4 text-[20px] font-semibold text-[#1F2937]">DETAILS</h2>
            <div className="space-y-4 text-[14px] text-[#6B7280]">
              <div>
                <p className="text-[12px] uppercase tracking-wide text-[#6B7280]">Type</p>
                <p className="mt-1 text-[14px] text-[#1F2937]">{toResourceTypeLabel(resource.type)}</p>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <p className="text-[14px] text-[#1F2937]">Capacity: {resource.capacity}</p>
              </div>
              <div className="flex items-center gap-2">
                <LocationIcon className="h-4 w-4" />
                <p className="text-[14px] text-[#1F2937]">{resource.location}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-6">
            <h2 className="mb-4 text-[20px] font-semibold text-[#1F2937]">AVAILABILITY WINDOWS</h2>
            <div className="flex flex-wrap gap-2">
              {(resource.availabilityWindows || []).length === 0 ? (
                <p className="text-[14px] text-[#6B7280]">No availability windows defined.</p>
              ) : (
                resource.availabilityWindows.map((window, index) => (
                  <span
                    key={`${window}-${index}`}
                    className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-semibold text-blue-700"
                  >
                    {window}
                  </span>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to={`/resources/${resource.id}/edit`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#1E3A5F] px-5 text-[14px] font-semibold text-[#1E3A5F] transition hover:bg-[#1E3A5F] hover:text-white"
          >
            Edit Resource
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#EF4444] px-5 text-[14px] font-semibold text-white transition hover:bg-[#D73A3A]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailPage;
