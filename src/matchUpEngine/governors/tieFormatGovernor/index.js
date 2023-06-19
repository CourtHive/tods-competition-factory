import { orderCollectionDefinitions } from './orderCollectionDefinitions';
import { removeCollectionDefinition } from './removeCollectionDefinition';
import { modifyCollectionDefinition } from './modifyCollectionDefinition';
import { addCollectionDefinition } from './addCollectionDefinition';
import { removeCollectionGroup } from './removeCollectionGroup';
import { calculateWinCriteria } from './calculateWinCriteria';
import { addCollectionGroup } from './addCollectionGroup';

export const tieFormatGovernor = {
  modifyCollectionDefinition,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  addCollectionDefinition,
  removeCollectionGroup,
  calculateWinCriteria,
  addCollectionGroup,
};

export default tieFormatGovernor;
