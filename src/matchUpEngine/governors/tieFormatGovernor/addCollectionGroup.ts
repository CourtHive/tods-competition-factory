import { decorateResult } from '../../../global/functions/decorateResult';
import { collectionGroupUpdate } from './collectionGroupUpdate';
import { getTieFormat } from './getTieFormat/getTieFormat';
import { validateTieFormat } from './tieFormatUtilities';
import { copyTieFormat } from './copyTieFormat';

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
  const stack = 'addCollectionGroup';
  if (!Array.isArray(collectionIds))
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

  // TODO: validate groupDefinition

  let result = !matchUp
    ? getTieFormat({
        drawDefinition,
        structureId,
        matchUpId,
        eventId,
        event,
      })
    : undefined;
  if (result?.error) return decorateResult({ result, stack });

  const structure = result?.structure;
  matchUp = matchUp || result?.matchUp;
  const existingTieFormat = result?.tieFormat;
  const originalValueGoal = existingTieFormat?.winCriteria.valueGoal;
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return decorateResult({ result, stack });

  // if any of the collectionIds are already part of a different collectionGroup, throw an error
  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    const { collectionId, collectionGroupNumber } = collectionDefinition;
    if (collectionGroupNumber && collectionIds.includes(collectionId))
      return decorateResult({
        info: 'collectionIds cannot be part of other collectionGroups',
        result: { error: INVALID_VALUES },
        stack,
      });
    // TODO: calculate the total value of the collectionDefinition
    // either matchUpCount * matchUpValue or collectionValue or collectionValueProfiles total
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
