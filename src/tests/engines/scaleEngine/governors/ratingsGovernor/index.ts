import { calculateNewRatings } from '@Generators/scales/calculateNewRatings';
import { generateDynamicRatings } from '@Generators/scales/generateDynamicRatings';

const governor = {
  calculateNewRatings,
  generateDynamicRatings,
};

export default governor;
