import { getTieFormat } from '../../../../tournamentEngine/getters/getTieFormat';
import { collectionGroupUpdate } from './collectionGroupUpdate';
import { validateTieFormat } from './tieFormatUtilities';
import { copyTieFormat } from './copyTieFormat';

import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

export function removeCollectionGroup({
  updateInProgressMatchUps = true,
  collectionGroupNumber,
  tournamentRecord,
  drawDefinition,
  tieFormatName,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  if (!collectionGroupNumber) return { error: MISSING_VALUE };
  if (isNaN(collectionGroupNumber)) return { error: INVALID_VALUES };

  let result = getTieFormat({
    tournamentRecord,
    drawDefinition,
    structureId,
    matchUpId,
    eventId,
    event,
  });
  if (result.error) return result;

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const originalValueGoal = existingTieFormat.winCriteria.valueGoal;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  // remove the collectionGroup and all references to it in other collectionDefinitions
  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
    (collectionDefinition) => {
      const { collectionGroupNumber: groupNumber, ...rest } =
        collectionDefinition;
      if (groupNumber !== collectionGroupNumber)
        rest.collectionGroupNumber = groupNumber;
      return rest;
    }
  );
  tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
    ({ groupNumber }) => groupNumber !== collectionGroupNumber
  );

  return collectionGroupUpdate({
    updateInProgressMatchUps,
    originalValueGoal,
    tournamentRecord,
    drawDefinition,
    tieFormatName,
    structureId,
    structure,
    tieFormat,
    matchUpId,
    matchUp,
    eventId,
    event,
  });
}
