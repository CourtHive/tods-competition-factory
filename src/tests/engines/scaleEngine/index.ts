import rankingsGovernor from './governors/rankingsGovernor';
import ratingsGovernor from './governors/ratingsGovernor';
import syncEngine from '../../../assemblies/engines/sync';

const methods = {
  ...rankingsGovernor,
  ...ratingsGovernor,
};

syncEngine.importMethods(methods);

export const scaleEngine = syncEngine;
export default syncEngine;
