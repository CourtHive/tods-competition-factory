import { makeDeepCopy } from '../../../../utilities';
import { updateTieFormat } from './updateTieFormat';
import { getTieFormat } from './getTieFormat';

import { INVALID_VALUES } from '../../../../constants/errorConditionConstants';

export function orderCollectionDefinitions({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUpId,
  orderMap,
  eventId,
  event,
}) {
  if (typeof orderMap !== 'object') return { error: INVALID_VALUES, orderMap };

  let result = getTieFormat({
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return result;

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const tieFormat = makeDeepCopy(existingTieFormat, false, true);

  tieFormat.collectionDefinitions.forEach((collectionDefinition) => {
    const collectionOrder = orderMap[collectionDefinition.collectionId];
    if (collectionOrder) collectionDefinition.collectionOrder = collectionOrder;
  });

  tieFormat.collectionDefinitions.sort(
    (a, b) => a.collectionOrder - b.collectionOrder
  );

  return updateTieFormat({
    tournamentRecord,
    drawDefinition,
    structure,
    tieFormat,
    eventId,
    matchUp,
    event,
  });
}
