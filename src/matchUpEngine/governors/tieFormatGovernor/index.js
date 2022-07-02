import { orderCollectionDefinitions } from './orderCollectionDefinitions';
import { removeCollectionDefinition } from './removeCollectionDefinition';
import { modifyCollectionDefinition } from './modifyCollectionDefinition';
import { addCollectionDefinition } from './addCollectionDefinition';
import { removeCollectionGroup } from './removeCollectionGroup';
import { addCollectionGroup } from './addCollectionGroup';

export const tieFormatGovernor = {
  modifyCollectionDefinition,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  addCollectionDefinition,
  removeCollectionGroup,
  addCollectionGroup,
};

export default tieFormatGovernor;
