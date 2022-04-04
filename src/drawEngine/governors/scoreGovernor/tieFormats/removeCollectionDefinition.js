// all child matchUps need to be checked for collectionAssignments which need to be removed when collectionDefinition.collectionIds are removed

import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';
import { makeDeepCopy } from '../../../../utilities';
import { getTieFormat } from './getTieFormat';
import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';

import { IN_PROGRESS } from '../../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

/*
 * collectionDefinition will be removed from an event tieFormat (if present)
 * if a matchUpId is provided, will be removed from matchUp.tieFormat
 * if a structureId is provided, will be removed from structure.tieFormat
 * TODO: determine whether all contained instances of tieFormat should be updated
 */
export function removeCollectionDefinition({
  updateInProgressMatchUps = true,
  tournamentRecord,
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

  const { matchUp, structure, tieFormat: existingTieFormat } = result;
  const tieFormat = makeDeepCopy(existingTieFormat, false, true);

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
    matchUps = getAllStructureMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      structure,
    })?.matchUps;
  } else {
    matchUps = allDrawMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      drawDefinition,
    })?.matchUps;
  }

  const deletedMatchUpIds = [];
  for (const matchUp of matchUps) {
    if (!updateInProgressMatchUps && matchUp.matchUpStatus === IN_PROGRESS)
      continue;

    // remove any collectionAssignments from LineUps that include collectionId
    for (const side of matchUp?.sides || []) {
      side.lineUp = (side.lineUp || []).map((assignment) =>
        (assignment?.collectionAssignments || []).filter(
          (collectionAssignment) =>
            collectionAssignment.collectionId !== collectionId
        )
      );
    }

    // delete any tieMatchUps that contain collectionId
    matchUp.tieMatchUps = (matchUp.tieMatchUps || []).filter((matchUp) => {
      const deleteTarget = matchUp.collectionId === collectionId;
      if (deleteTarget) deletedMatchUpIds.push(matchUp.matchUpId);
      return !deleteTarget;
    });

    matchUp.tieFormat = tieFormat;
  }

  // remove any matchUps which contain collectionId
  if (deletedMatchUpIds.length) {
    // notify subscribers that matchUps have been deleted
    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: deletedMatchUpIds,
      drawDefinition,
    });
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
    // NOTE: there is not a modifyEventNotice
  } else if (matchUp) {
    matchUp.tieFormat = tieFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  } else if (structure) {
    structure.tieFormat = tieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = tieFormat;
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS, tieFormat };
}
