import { getAllResources } from './resourceService';

const getResourceStats = async () => {
  const resources = await getAllResources();

  const byType = resources.reduce((acc, resource) => {
    const key = resource.type || 'UNKNOWN';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const active = resources.filter((resource) => resource.status === 'ACTIVE').length;
  const outOfService = resources.filter((resource) => resource.status === 'OUT_OF_SERVICE').length;

  return {
    total: resources.length,
    active,
    outOfService,
    byType
  };
};

const statsService = {
  getResourceStats
};

export default statsService;
