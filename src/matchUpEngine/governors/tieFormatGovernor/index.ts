import { orderCollectionDefinitions } from '../../../mutate/tieFormat/orderCollectionDefinitions';
import { removeCollectionDefinition } from '../../../mutate/tieFormat/removeCollectionDefinition';
import { modifyCollectionDefinition } from './modifyCollectionDefinition';
import { addCollectionDefinition } from '../../../mutate/tieFormat/addCollectionDefinition';
import { removeCollectionGroup } from './removeCollectionGroup';
import { calculateWinCriteria } from './calculateWinCriteria';
import { addCollectionGroup } from './addCollectionGroup';
import { modifyTieFormat } from './modifyTieFormat';

export const tieFormatGovernor = {
  modifyCollectionDefinition,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  addCollectionDefinition,
  removeCollectionGroup,
  calculateWinCriteria,
  addCollectionGroup,
  modifyTieFormat,
};

export default tieFormatGovernor;
