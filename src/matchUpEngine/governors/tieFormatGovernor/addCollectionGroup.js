import { collectionGroupUpdate } from './collectionGroupUpdate';
import { validateTieFormat } from './tieFormatUtilities';
import { copyTieFormat } from './copyTieFormat';
import { getTieFormat } from './getTieFormat';

import {
  INVALID_VALUES,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function addCollectionGroup({
  updateInProgressMatchUps = true,
  tournamentRecord,
  groupDefinition,
  drawDefinition,
  collectionIds,
  tieFormatName,
  structureId,
  matchUpId,
  matchUp,
  eventId,
  event,
}) {
  if (!Array.isArray(collectionIds)) return { error: MISSING_VALUE };

  // TODO: validate groupDefinition

  let result =
    !matchUp &&
    getTieFormat({
      tournamentRecord,
      drawDefinition,
      structureId,
      matchUpId,
      eventId,
      event,
    });
  if (result.error) return result;

  const { structure } = result;
  matchUp = matchUp || result.matchUp;
  const existingTieFormat = result.tieFormat || matchUp?.tieFormat;
  const originalValueGoal = existingTieFormat.winCriteria.valueGoal;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  // if any of the collectionIds are already part of a different collectionGroup, throw an error
  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    const { collectionId, collectionGroupNumber } = collectionDefinition;
    if (collectionGroupNumber && collectionIds.includes(collectionId))
      return {
        error: INVALID_VALUES,
        info: 'collectionIds cannot be part of other collectionGroups',
      };
    // TODO: calculate the total value of the collectionDefinition
    // either matchUpCount * matchUpValue or collectionValue or collectionValueProfile total
    // if not gropuDEfinition.winCriteria.aggregateValue then caluculate valueGoal automatically
  }

  const maxGroupNumber = (tieFormat.collectionGroups || []).reduce(
    (max, group) => (group.groupNumber > max ? group.groupNumber : max),
    0
  );
  const collectionGroupNumber = maxGroupNumber + 1;
  groupDefinition.groupNumber = collectionGroupNumber;

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
