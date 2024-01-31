import rankingsGovernor from './governors/rankingsGovernor';
import ratingsGovernor from './governors/ratingsGovernor';
import syncEngine from '@Assemblies/engines/sync';

const methods = {
  ...rankingsGovernor,
  ...ratingsGovernor,
};

syncEngine.importMethods(methods);

export const scaleEngine = syncEngine;
export default syncEngine;
