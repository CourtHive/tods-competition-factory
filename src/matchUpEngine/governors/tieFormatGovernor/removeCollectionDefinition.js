// all child matchUps need to be checked for collectionAssignments which need to be removed when collectionDefinition.collectionIds are removed

import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { updateTieMatchUpScore } from '../../../drawEngine/governors/matchUpGovernor/tieMatchUpScore';
import { definedAttributes } from '../../../utilities/objects';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';
import { scoreHasValue } from '../queryGovernor/scoreHasValue';
import { copyTieFormat } from './copyTieFormat';
import { getTieFormat } from './getTieFormat';
import {
  deleteMatchUpsNotice,
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../drawEngine/notifications/drawNotifications';
import {
  allDrawMatchUps,
  allEventMatchUps,
} from '../../../tournamentEngine/getters/matchUpsGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';
import {
  MISSING_DRAW_DEFINITION,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

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
  matchUp,
  event,
}) {
  let result =
    !matchUp &&
    getTieFormat({
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
  const tieFormat = copyTieFormat(existingTieFormat);

  result = validateTieFormat({ tieFormat });
  if (result.error) return result;

  const targetCollection = tieFormat?.collectionDefinitions?.find(
    (collectionDefinition) => collectionDefinition.collectionId === collectionId
  );
  if (!targetCollection) return { error: NOT_FOUND, collectionId };

  tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.filter(
    (collectionDefinition) => collectionDefinition.collectionId !== collectionId
  );

  // if the collectionDefinition being removed contains a collectionGroupNumber,
  // remove the collectionGroup and all references to it in other collectionDefinitions
  if (targetCollection.collectionGroupNumber) {
    tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
      (collectionDefinition) => {
        const { collectionGroupNumber, ...rest } = collectionDefinition;
        if (collectionGroupNumber) true;
        return rest;
      }
    );
    tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
      ({ groupNumber }) =>
        groupNumber !== targetCollection.collectionGroupNumber
    );
  }

  // calculate new winCriteria for tieFormat
  // if existing winCriteria is aggregateValue, retain
  const { aggregateValue, valueGoal } = calculateWinCriteria(tieFormat);

  tieFormat.winCriteria = { aggregateValue, valueGoal };

  // if valueGoal has changed, force renaming of the tieFormat
  const originalValueGoal = existingTieFormat.winCriteria.valueGoal;
  if (originalValueGoal && originalValueGoal !== valueGoal) {
    if (tieFormatName) {
      tieFormat.tieFormatName = tieFormatName;
    } else {
      delete tieFormat.tieFormatName;
    }
  }

  // check all scoped lineUps in the drawDefinition to identify collectionAssignments
  let matchUps = [];

  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps = getAllStructureMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      structure,
    })?.matchUps;
  } else if (drawDefinition) {
    matchUps = allDrawMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      drawDefinition,
    })?.matchUps;
  } else if (event) {
    matchUps = allEventMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      drawDefinition,
    })?.matchUps;
  }

  // all team matchUps in scope which are completed or which have a tieFormat should not be modified
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      !matchUp.winningSide &&
      matchUp.matchUpStatus !== COMPLETED &&
      (updateInProgressMatchUps ||
        (matchUp.matchUpStatus !== IN_PROGRESS && !scoreHasValue(matchUp)))
  );

  const deletedMatchUpIds = [];
  for (const matchUp of targetMatchUps) {
    // remove any collectionAssignments from LineUps that include collectionId
    for (const side of matchUp?.sides || []) {
      side.lineUp = (side.lineUp || []).map((assignment) => ({
        participantId: assignment.participantId,
        collectionAssignments: (assignment?.collectionAssignments || []).filter(
          (collectionAssignment) =>
            collectionAssignment.collectionId !== collectionId
        ),
      }));
    }

    // delete any tieMatchUps that contain collectionId
    matchUp.tieMatchUps = (matchUp.tieMatchUps || []).filter((matchUp) => {
      const deleteTarget = matchUp.collectionId === collectionId;
      if (deleteTarget) deletedMatchUpIds.push(matchUp.matchUpId);
      return !deleteTarget;
    });

    if (matchUp.tieFormat) matchUp.tieFormat = copyTieFormat(tieFormat);

    if (updateInProgressMatchUps) {
      // recalculate score
      const result = updateTieMatchUpScore({
        matchUpId: matchUp.matchUpId,
        exitWhenNoValues: true,
        tournamentRecord,
        drawDefinition,
        event,
      });
      if (result.error) return result;
    }

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
      matchUp,
    });
  }

  // remove any matchUps which contain collectionId
  if (deletedMatchUpIds.length) {
    // notify subscribers that matchUps have been deleted
    deleteMatchUpsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      matchUpIds: deletedMatchUpIds,
      eventId: event?.eventId,
      drawDefinition,
    });
  }

  const prunedTieFormat = definedAttributes(tieFormat);
  if (eventId) {
    event.tieFormat = prunedTieFormat;
    // NOTE: there is not a modifyEventNotice
  } else if (matchUpId) {
    matchUp.tieFormat = tieFormat;
  } else if (structure) {
    structure.tieFormat = prunedTieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = prunedTieFormat;
  } else if (!matchUp || !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  modifyDrawNotice({ drawDefinition, eventId: event?.eventId });

  return {
    ...SUCCESS,
    tieFormat: prunedTieFormat,
    targetMatchUps,
    deletedMatchUpIds,
  };
}
