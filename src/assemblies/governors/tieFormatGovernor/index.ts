import { modifyCollectionDefinition } from 'mutate/matchUps/tieFormat/modifyCollectionDefinition';
import { removeCollectionGroup } from 'mutate/matchUps/tieFormat/removeCollectionGroup';
import { tieFormatGenderValidityCheck } from 'validators/tieFormatGenderValidityCheck';
import { orderCollectionDefinitions } from 'mutate/tieFormat/orderCollectionDefinitions';
import { removeCollectionDefinition } from 'mutate/tieFormat/removeCollectionDefinition';
import { validateCollectionDefinition } from 'validators/validateCollectionDefinition';
import { addCollectionGroup } from 'mutate/matchUps/tieFormat/addCollectionGroup';
import { addCollectionDefinition } from 'mutate/tieFormat/addCollectionDefinition';
import { modifyTieFormat } from 'mutate/matchUps/tieFormat/modifyTieFormat';
import { aggregateTieFormats } from 'mutate/tieFormat/aggregateTieFormats';

export const tieFormatGovernor = {
  addCollectionDefinition,
  addCollectionGroup,
  aggregateTieFormats,
  modifyCollectionDefinition,
  modifyTieFormat,
  orderCollectionDefinitions,
  removeCollectionDefinition,
  removeCollectionGroup,
  validateCollectionDefinition,
  tieFormatGenderValidityCheck,
};

export default tieFormatGovernor;
