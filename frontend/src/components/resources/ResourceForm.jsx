import { useEffect, useMemo, useState } from 'react';

const toLabel = (value) => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
const emptyWindow = { fromDate: '', fromTime: '', toDate: '', toTime: '' };

const parseAvailabilityWindow = (value) => {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})\s-\s(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})$/);

  if (!match) return null;

  return {
    fromDate: match[1],
    fromTime: match[2],
    toDate: match[3],
    toTime: match[4]
  };
};

const isWindowEmpty = (window) => !window.fromDate && !window.fromTime && !window.toDate && !window.toTime;
const isWindowComplete = (window) => window.fromDate && window.fromTime && window.toDate && window.toTime;

const formatAvailabilityWindow = (window) => `${window.fromDate} ${window.fromTime} - ${window.toDate} ${window.toTime}`;

const emptyForm = {
  name: '',
  type: '',
  capacity: '',
  location: '',
  description: '',
  status: '',
  availabilityWindows: [{ ...emptyWindow }]
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
        availabilityWindows: (() => {
          const parsed = (initialValues.availabilityWindows || []).map(parseAvailabilityWindow).filter(Boolean);
          return parsed.length > 0 ? parsed : [{ ...emptyWindow }];
        })()
      });
      setErrors({});
    }
  }, [initialValues]);

  const hasAvailabilityEntries = useMemo(
    () => values.availabilityWindows.some((window) => isWindowComplete(window)),
    [values.availabilityWindows]
  );

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const setAvailability = (index, field, value) => {
    setValues((prev) => {
      const next = [...prev.availabilityWindows];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, availabilityWindows: next };
    });
  };

  const addAvailability = () => {
    setValues((prev) => ({ ...prev, availabilityWindows: [...prev.availabilityWindows, { ...emptyWindow }] }));
  };

  const removeAvailability = (index) => {
    setValues((prev) => {
      const next = prev.availabilityWindows.filter((_, idx) => idx !== index);
      return { ...prev, availabilityWindows: next.length ? next : [{ ...emptyWindow }] };
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

    const hasPartialWindow = values.availabilityWindows.some((window) => !isWindowEmpty(window) && !isWindowComplete(window));
    if (hasPartialWindow) {
      nextErrors.availabilityWindows = 'Complete all date and time fields for each availability window';
    }

    const hasInvalidRange = values.availabilityWindows.some((window) => {
      if (!isWindowComplete(window)) return false;
      const start = new Date(`${window.fromDate}T${window.fromTime}`);
      const end = new Date(`${window.toDate}T${window.toTime}`);
      return end < start;
    });
    if (hasInvalidRange) {
      nextErrors.availabilityWindows = 'End date/time must be after start date/time';
    }

    if (!hasAvailabilityEntries && !nextErrors.availabilityWindows) {
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
      availabilityWindows: values.availabilityWindows
        .filter((window) => isWindowComplete(window))
        .map(formatAvailabilityWindow)
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
            <div key={index} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">From Date</label>
                <input
                  type="date"
                  value={window.fromDate}
                  onChange={(event) => setAvailability(index, 'fromDate', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">From Time</label>
                <input
                  type="time"
                  value={window.fromTime}
                  onChange={(event) => setAvailability(index, 'fromTime', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">To Date</label>
                <input
                  type="date"
                  value={window.toDate}
                  onChange={(event) => setAvailability(index, 'toDate', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">To Time</label>
                <input
                  type="time"
                  value={window.toTime}
                  onChange={(event) => setAvailability(index, 'toTime', event.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => removeAvailability(index)}
                className="h-fit rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 lg:mt-6"
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
