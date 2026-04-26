import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import resourceService from '../../services/resourceService';

const formatLabel = (value) =>
  (value || '')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const statusStyles = {
  ACTIVE: 'bg-[#10B981]/15 text-[#047857]', // Occupied
  NOT_ACTIVE: 'bg-blue-50 text-blue-600 border-blue-100', // Available
  OUT_OF_SERVICE: 'bg-rose-50 text-rose-600 border-rose-100' // Under maintenance
};

function ResourceDetailPage() {
  const { user, isAdmin } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setIsLoading(true);
        const data = await resourceService.getResourceById(id);
        setResource(data);
      } catch {
        toast.error('Failed to load resource details');
        navigate('/resources');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await resourceService.deleteResource(id);
      toast.success('Resource deleted successfully');
      navigate('/resources');
    } catch {
      toast.error('Failed to delete resource');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading resource details..." />;
  }

  if (!resource) return null;

  return (
    <>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-[#1E3A5F] hover:underline"
        >
          Back
        </button>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{resource.name}</h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[resource.status] || 'bg-slate-200 text-slate-700'
              }`}
            >
              {formatLabel(resource.status)}
            </span>
          </div>

          <p className="mt-4 text-slate-600">{resource.description || 'No description available.'}</p>

          <div className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
              <p className="mt-1 font-medium text-slate-800">{formatLabel(resource.type)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Capacity</p>
              <p className="mt-1 font-medium text-slate-800">{resource.capacity}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
              <p className="mt-1 font-medium text-slate-800">{resource.location}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-800">Availability Windows</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(resource.availabilityWindows || []).map((window) => (
                <span key={window} className="rounded-full bg-[#F59E0B]/15 px-3 py-1 text-xs font-semibold text-[#B45309]">
                  {window}
                </span>
              ))}
            </div>
          </div>

          {isAdmin() && (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={`/resources/${resource.id}/edit`}
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Edit Resource
              </Link>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="rounded-md bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Delete
              </button>
            </div>
          )}

          {isTeacher && resource.status === 'NOT_ACTIVE' && (
            <div className="mt-7">
              <Link
                to="/bookings"
                state={{ preselectedResourceId: resource.id, preselectedResourceName: resource.name }}
                className="inline-block rounded-xl bg-[#1E3A5F] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-100"
              >
                Request this Classroom
              </Link>
            </div>
          )}
          
          {isTeacher && resource.status !== 'NOT_ACTIVE' && (
            <div className="mt-7 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-slate-500 italic">
                {resource.status === 'ACTIVE' 
                  ? 'This classroom is currently occupied by another activity.' 
                  : 'This facility is currently out of service for maintenance.'}
              </p>
            </div>
          )}
        </section>
      </div>

      {isAdmin() && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Resource"
          message="This action cannot be undone. Are you sure you want to delete this resource?"
          confirmText="Delete Resource"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialogOpen(false)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

export default ResourceDetailPage;
