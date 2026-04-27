import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ResourceForm from '../../components/resources/ResourceForm';
import resourceService from '../../services/resourceService';

const TYPE_OPTIONS = ['STUDIES', 'LAB_WORK', 'COMPUTER_LAB', 'PRESENTATION', 'LECTURE_HALL'];
const STATUS_OPTIONS = ['ACTIVE', 'NOT_ACTIVE', 'OUT_OF_SERVICE'];
const LOCATION_OPTIONS = ['L606', 'G606', 'LAB_POLE', 'MAIN_BUILDING', 'IT_WING', 'ENGINEERING_BLOCK'];

function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [initialValues, setInitialValues] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchResource = async () => {
      try {
        setIsLoading(true);
        const data = await resourceService.getResourceById(id);
        setInitialValues(data);
      } catch {
        toast.error('Failed to load resource for editing');
        navigate('/resources');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      const saved = isEditMode
        ? await resourceService.updateResource(id, payload)
        : await resourceService.createResource(payload);

      toast.success(isEditMode ? 'Resource updated successfully' : 'Resource created successfully');
      navigate(`/resources/${saved.id}`);
    } catch {
      toast.error(isEditMode ? 'Failed to update resource' : 'Failed to create resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading resource form..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{isEditMode ? 'Edit Resource' : 'Create Resource'}</h1>
        <p className="mt-1 text-sm text-slate-600">Manage facilities and asset information.</p>
      </div>

      <ResourceForm
        initialValues={initialValues}
        typeOptions={TYPE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        locationOptions={LOCATION_OPTIONS}
        isSubmitting={isSubmitting}
        submitLabel={isEditMode ? 'Update Resource' : 'Create Resource'}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default ResourceFormPage;
