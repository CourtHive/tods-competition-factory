import { makeDeepCopy } from '../../../../utilities';
import { updateTieFormat } from './updateTieFormat';
import { getTieFormat } from './getTieFormat';

export function orderCollectionDefinitions({
  tournamentRecord,
  drawDefinition,
  structureId,
  matchUpId,
  orderMap,
  eventId,
  event,
}) {
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
