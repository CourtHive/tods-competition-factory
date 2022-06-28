import { collectionGroupUpdate } from './collectionGroupUpdate';
import { validateTieFormat } from './tieFormatUtilities';
import { copyTieFormat } from './copyTieFormat';
import { getTieFormat } from './getTieFormat';

import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';

export function addCollectionGroup({
  updateInProgressMatchUps = true,
  tournamentRecord,
  groupDefinition,
  drawDefinition,
  collectionIds,
  tieFormatName,
  structureId,
  matchUpId,
  eventId,
  event,
}) {
  if (!Array.isArray(collectionIds)) return { error: MISSING_VALUE };

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

  // if any of the collectionIds are already part of a different collectionGroup, throw an error
  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    const { collectionId } = collectionDefinition;
    if (collectionIds.includes(collectionId))
      return {
        error: INVALID_VALUES,
        info: 'collectionIds cannot be part of other collectionGroups',
      };
  }

  const maxGroupNumber = (tieFormat.collectionGroups || []).reduce(
    (max, group) => (group.groupNumber > max ? group.groupNumber : max),
    0
  );
  const collectionGroupNumber = maxGroupNumber + 1;

  // add collectionGroupNumber to all targeted collectionDefinitions
  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
    (collectionDefinition) => {
      if (collectionIds.includes(collectionDefinition.collectionId)) {
        return { ...collectionDefinition, collectionGroupNumber };
      } else {
        return collectionDefinition;
      }
    }
  );

  tieFormat.collectionGroups = [
    ...(tieFormat.collecitonGroups || []),
    groupDefinition,
  ];

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
