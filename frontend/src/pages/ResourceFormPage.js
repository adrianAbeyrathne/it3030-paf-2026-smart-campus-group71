import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { CloseIcon } from '../components/icons';
import {
  createResource,
  getResourceById,
  updateResource
} from '../services/resourceService';
import { resourceTypeOptions, statusOptions } from '../utils/resourceUi';

const defaultFormState = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  description: '',
  status: 'ACTIVE',
  availabilityWindows: ['']
};

function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadResource = async () => {
      setLoading(true);
      try {
        const resource = await getResourceById(id);
        setForm({
          name: resource.name || '',
          type: resource.type || '',
          capacity: resource.capacity || '',
          location: resource.location || '',
          description: resource.description || '',
          status: resource.status || 'ACTIVE',
          availabilityWindows:
            resource.availabilityWindows && resource.availabilityWindows.length > 0
              ? resource.availabilityWindows
              : ['']
        });
      } catch (error) {
        toast.error('Failed to load resource');
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id, isEditMode, navigate]);

  const title = useMemo(
    () => (isEditMode ? 'Edit Resource' : 'Add New Resource'),
    [isEditMode]
  );

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Resource name is required';
    }
    if (!form.type) {
      nextErrors.type = 'Type is required';
    }
    if (!form.capacity || Number(form.capacity) < 1) {
      nextErrors.capacity = 'Capacity must be at least 1';
    }
    if (!form.location.trim()) {
      nextErrors.location = 'Location is required';
    }
    if (!form.status) {
      nextErrors.status = 'Status is required';
    }

    const cleanedWindows = form.availabilityWindows
      .map((window) => window.trim())
      .filter(Boolean);

    if (cleanedWindows.length === 0) {
      nextErrors.availabilityWindows = 'Add at least one availability window';
    }

    form.availabilityWindows.forEach((window, index) => {
      if (!window.trim()) {
        nextErrors[`window_${index}`] = 'Availability window cannot be empty';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleWindowChange = (index, value) => {
    setForm((prev) => {
      const nextWindows = [...prev.availabilityWindows];
      nextWindows[index] = value;
      return { ...prev, availabilityWindows: nextWindows };
    });
  };

  const addWindow = () => {
    setForm((prev) => ({ ...prev, availabilityWindows: [...prev.availabilityWindows, ''] }));
  };

  const removeWindow = (index) => {
    setForm((prev) => {
      if (prev.availabilityWindows.length === 1) {
        return prev;
      }
      return {
        ...prev,
        availabilityWindows: prev.availabilityWindows.filter((_, windowIndex) => windowIndex !== index)
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      type: form.type,
      capacity: Number(form.capacity),
      location: form.location.trim(),
      description: form.description.trim(),
      status: form.status,
      availabilityWindows: form.availabilityWindows.map((window) => window.trim())
    };

    try {
      const savedResource = isEditMode
        ? await updateResource(id, payload)
        : await createResource(payload);

      toast.success(isEditMode ? 'Resource updated successfully' : 'Resource created successfully');
      navigate(`/resources/${savedResource.id}`);
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update resource' : 'Failed to create resource');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="mb-6 text-[32px] font-bold leading-tight text-[#1F2937]">{title}</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1F2937]">Resource Name</label>
              <input
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
              />
              {errors.name && <p className="mt-1 text-[12px] text-[#EF4444]">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1F2937]">Type</label>
              <select
                value={form.type}
                onChange={(event) => handleChange('type', event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
              >
                <option value="">Select type</option>
                {resourceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-[12px] text-[#EF4444]">{errors.type}</p>}
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1F2937]">Capacity</label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) => handleChange('capacity', event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
              />
              {errors.capacity && <p className="mt-1 text-[12px] text-[#EF4444]">{errors.capacity}</p>}
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-semibold text-[#1F2937]">Location</label>
              <input
                value={form.location}
                onChange={(event) => handleChange('location', event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
              />
              {errors.location && <p className="mt-1 text-[12px] text-[#EF4444]">{errors.location}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-semibold text-[#1F2937]">Description</label>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
            />
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-semibold text-[#1F2937]">Status</label>
            <select
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-[12px] text-[#EF4444]">{errors.status}</p>}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[20px] font-semibold text-[#1F2937]">Availability Windows</h3>
              <button
                type="button"
                onClick={addWindow}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#10B981] px-4 text-[14px] font-semibold text-white transition hover:bg-[#0EA271]"
              >
                + Add Window
              </button>
            </div>

            <div className="space-y-3">
              {form.availabilityWindows.map((window, index) => (
                <div key={`window-${index}`}>
                  <div className="flex items-center gap-2">
                    <input
                      value={window}
                      onChange={(event) => handleWindowChange(index, event.target.value)}
                      placeholder="e.g., Mon-Fri 08:00-17:00"
                      className="h-11 flex-1 rounded-lg border border-slate-300 px-3 text-[14px] outline-none transition focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15"
                    />
                    <button
                      type="button"
                      onClick={() => removeWindow(index)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-slate-700 transition hover:bg-slate-300"
                      aria-label="Remove window"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {errors[`window_${index}`] && (
                    <p className="mt-1 text-[12px] text-[#EF4444]">{errors[`window_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {errors.availabilityWindows && (
              <p className="mt-1 text-[12px] text-[#EF4444]">{errors.availabilityWindows}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              to={isEditMode ? `/resources/${id}` : '/resources'}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-200 px-5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-300"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-[14px] font-semibold text-white transition ${
                isEditMode
                  ? 'bg-[#1E3A5F] hover:bg-[#172F4D]'
                  : 'bg-[#10B981] hover:bg-[#0EA271]'
              } ${submitting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {submitting
                ? 'Saving...'
                : isEditMode
                ? 'Update Resource'
                : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceFormPage;