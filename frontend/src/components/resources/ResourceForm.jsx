import { useEffect, useMemo, useState } from 'react';

const toLabel = (value) => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const emptyForm = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  description: '',
  status: '',
  availabilityWindows: ['']
};

function ResourceForm({
  initialValues,
  typeOptions,
  statusOptions,
  isSubmitting,
  submitLabel,
  onSubmit
}) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name || '',
        type: initialValues.type || '',
        capacity: initialValues.capacity?.toString() || '',
        location: initialValues.location || '',
        description: initialValues.description || '',
        status: initialValues.status || '',
        availabilityWindows:
          initialValues.availabilityWindows && initialValues.availabilityWindows.length > 0
            ? initialValues.availabilityWindows
            : ['']
      });
      setErrors({});
    }
  }, [initialValues]);

  const hasAvailabilityEntries = useMemo(
    () => values.availabilityWindows.some((entry) => entry.trim() !== ''),
    [values.availabilityWindows]
  );

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const setAvailability = (index, value) => {
    setValues((prev) => {
      const next = [...prev.availabilityWindows];
      next[index] = value;
      return { ...prev, availabilityWindows: next };
    });
  };

  const addAvailability = () => {
    setValues((prev) => ({ ...prev, availabilityWindows: [...prev.availabilityWindows, ''] }));
  };

  const removeAvailability = (index) => {
    setValues((prev) => {
      const next = prev.availabilityWindows.filter((_, idx) => idx !== index);
      return { ...prev, availabilityWindows: next.length ? next : [''] };
    });
  };

  const validate = () => {
    const nextErrors = {};

    if (!values.name.trim()) nextErrors.name = 'Name is required';
    if (!values.type) nextErrors.type = 'Type is required';
    if (!values.location.trim()) nextErrors.location = 'Location is required';
    if (!values.status) nextErrors.status = 'Status is required';

    const numericCapacity = Number(values.capacity);
    if (!values.capacity || Number.isNaN(numericCapacity)) {
      nextErrors.capacity = 'Capacity is required';
    } else if (numericCapacity <= 0) {
      nextErrors.capacity = 'Capacity must be greater than 0';
    }

    if (!hasAvailabilityEntries) {
      nextErrors.availabilityWindows = 'At least one availability window is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: values.name.trim(),
      type: values.type,
      capacity: Number(values.capacity),
      location: values.location.trim(),
      description: values.description.trim(),
      status: values.status,
      availabilityWindows: values.availabilityWindows.map((value) => value.trim()).filter(Boolean)
    });
  };

  const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-[#1E3A5F]/20 focus:ring';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input id="name" value={values.name} onChange={(event) => setField('name', event.target.value)} className={inputClass} />
          {errors.name && <p className="mt-1 text-xs text-[#EF4444]">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-slate-700">
            Type
          </label>
          <select id="type" value={values.type} onChange={(event) => setField('type', event.target.value)} className={inputClass}>
            <option value="">Select type</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {toLabel(option)}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-[#EF4444]">{errors.type}</p>}
        </div>

        <div>
          <label htmlFor="capacity" className="mb-1 block text-sm font-medium text-slate-700">
            Capacity
          </label>
          <input
            id="capacity"
            type="number"
            min="1"
            value={values.capacity}
            onChange={(event) => setField('capacity', event.target.value)}
            className={inputClass}
          />
          {errors.capacity && <p className="mt-1 text-xs text-[#EF4444]">{errors.capacity}</p>}
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            value={values.location}
            onChange={(event) => setField('location', event.target.value)}
            className={inputClass}
          />
          {errors.location && <p className="mt-1 text-xs text-[#EF4444]">{errors.location}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows="3"
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select id="status" value={values.status} onChange={(event) => setField('status', event.target.value)} className={inputClass}>
            <option value="">Select status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {toLabel(option)}
              </option>
            ))}
          </select>
          {errors.status && <p className="mt-1 text-xs text-[#EF4444]">{errors.status}</p>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Availability Windows</p>
          <button
            type="button"
            onClick={addAvailability}
            className="rounded-md bg-[#1E3A5F] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
          >
            + Add Window
          </button>
        </div>

        <div className="space-y-2">
          {values.availabilityWindows.map((window, index) => (
            <div key={`${window}-${index}`} className="flex items-center gap-2">
              <input
                value={window}
                onChange={(event) => setAvailability(index, event.target.value)}
                placeholder="e.g. Mon-Fri 08:00 - 16:00"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeAvailability(index)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {errors.availabilityWindows && <p className="mt-1 text-xs text-[#EF4444]">{errors.availabilityWindows}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export default ResourceForm;
