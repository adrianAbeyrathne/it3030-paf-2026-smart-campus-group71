export const resourceTypeOptions = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' }
];

export const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' }
];

export const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'LECTURE_HALL':
      return 'bg-blue-100 text-blue-700';
    case 'LAB':
      return 'bg-purple-100 text-purple-700';
    case 'MEETING_ROOM':
      return 'bg-teal-100 text-teal-700';
    case 'EQUIPMENT':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const getStatusBadgeClass = (status) =>
  status === 'ACTIVE'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

export const toResourceTypeLabel = (value) =>
  resourceTypeOptions.find((option) => option.value === value)?.label || value;

export const toStatusLabel = (value) =>
  statusOptions.find((option) => option.value === value)?.label || value;
