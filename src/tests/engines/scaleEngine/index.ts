import rankingsGovernor from './governors/rankingsGovernor';
import ratingsGovernor from './governors/ratingsGovernor';
import syncEngine from '@Assemblies/engines/sync';

const methods = {
  ...rankingsGovernor,
  ...ratingsGovernor,
};

syncEngine.importMethods(methods);

export { syncEngine as scaleEngine };
export default syncEngine;
