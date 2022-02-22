// all child matchUps need to be checked for collectionAssignments which need to be removed when collectionDefinition.collectionIds are removed

import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';
import { getTieFormat } from './getTieFormat';

import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

/*
 * collectionDefinition will be added to an event tieFormat (if present)
 * if a matchUpId is provided, will be added to matchUp.tieFormat
 * if a structureId is provided, will be added to structure.tieFormat
 * TODO: determine whether all contained instances of tieFormat should be updated
 */
export function removeCollectionDefinition({
  drawDefinition,
  tieFormatName,
  collectionId,
  structureId,
  matchUpId,
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

  const { matchUp, structure, tieFormat } = result;

  result = validateTieFormat({ tieFormat });
  if (!result.valid) return { error: INVALID_VALUES, errors: result.errors };

  const originalValueGoal = tieFormat.winCriteria.valueGoal;

  const collectionExists = tieFormat?.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  if (!collectionExists) return { error: NOT_FOUND, collectionId };

  // check all scoped lineUps in the drawDefinition to identify collectionAssignments
  let matchUps = [];

  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps = allDrawMatchUps({
      drawDefinition,
      matchUpFilters: { matchUpTypes: [TEAM] },
    })?.matchUps;
  } else {
    matchUps = getAllStructureMatchUps({
      structure,
      matchUpFilters: { matchUpTypes: [TEAM] },
    })?.matchUps;
  }

  // remove any collectionAssignments from LineUps that include collectionId
  for (const matchUp of matchUps) {
    for (const side of matchUp?.sides || []) {
      side.lineUp = (side.lineUp || []).map((assignment) =>
        (assignment?.collectionAssignments || []).filter(
          (collectionAssignment) =>
            collectionAssignment.collectionId !== collectionId
        )
      );
    }
  }

  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.filter(
    (collectionDefinition) => collectionDefinition.collectionId !== collectionId
  );

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria({
    collectionDefinitions: tieFormat.collectionDefinitions,
  });

  tieFormat.winCriteria = { aggregateValue, valueGoal };

  // if valueGoal has changed, force renaming of the tieFormat
  if (originalValueGoal && originalValueGoal !== valueGoal) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  if (eventId) {
    event.tieFormat = tieFormat;
  } else if (matchUp) {
    matchUp.tieFormat = tieFormat;
  } else if (structure) {
    structure.tieFormat = tieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = tieFormat;
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS, tieFormat };
}
