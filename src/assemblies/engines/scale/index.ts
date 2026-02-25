import * as rankingGovernor from '@Assemblies/governors/rankingGovernor';
import { calculateNewRatings } from '@Generators/scales/calculateNewRatings';
import { generateDynamicRatings } from '@Generators/scales/generateDynamicRatings';
import syncEngine from '@Assemblies/engines/sync';

const ratingsGovernor = {
  calculateNewRatings,
  generateDynamicRatings,
};

syncEngine.importMethods({ ...rankingGovernor, ...ratingsGovernor });

export { syncEngine as scaleEngine };
export default syncEngine;
