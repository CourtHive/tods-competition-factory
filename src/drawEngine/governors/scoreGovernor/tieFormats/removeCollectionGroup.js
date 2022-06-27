import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { getTieFormat } from '../../../../tournamentEngine/getters/getTieFormat';
import { updateTieMatchUpScore } from '../../matchUpGovernor/tieMatchUpScore';
import { definedAttributes } from '../../../../utilities/objects';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';
import { scoreHasValue } from '../scoreHasValue';
import { copyTieFormat } from './copyTieFormat';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';

import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_VALUE,
} from '../../../../constants/errorConditionConstants';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../../constants/matchUpStatusConstants';

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

  if (collectionGroupNumber) {
    // remove the collectionGroup and all references to it in other collectionDefinitions
    tieFormat.collectionDefinitions = tieFormat.collectionDefinitions.map(
      (collectionDefinition) => {
        const { collectionGroupNumber, ...rest } = collectionDefinition;
        if (collectionGroupNumber) true;
        return rest;
      }
    );
    tieFormat.collectionGroups = tieFormat.collectionGroups.filter(
      ({ groupNumber }) => groupNumber !== collectionGroupNumber
    );
  }

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

  // check all scoped lineUps in the drawDefinition to identify collectionAssignments
  let matchUps = [];

  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps = getAllStructureMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      // inContext: false,
      structure,
    })?.matchUps;
  } else if (drawDefinition) {
    matchUps = allDrawMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      // inContext: false,
      drawDefinition,
    })?.matchUps;
  }

  // all team matchUps in scope which are completed or which have a tieFormat should not be modified
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      !matchUp.winningSide &&
      matchUp.matchUpStatus !== COMPLETED &&
      !(!updateInProgressMatchUps && matchUp.matchUpStatus === IN_PROGRESS) &&
      !(!updateInProgressMatchUps && scoreHasValue(matchUp))
  );

  for (const matchUp of targetMatchUps) {
    const hasTieFormat = !!matchUp.tieFormat;
    if (hasTieFormat) {
      matchUp.tieFormat = copyTieFormat(tieFormat);
    }

    let scoreUpdated;
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
      scoreUpdated = result.score;
    }

    if (hasTieFormat && !scoreUpdated) {
      console.log('boo', { scoreUpdated, hasTieFormat });

      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        eventId: event?.eventId,
        drawDefinition,
        matchUp,
      });
    }
  }

  const prunedTieFormat = definedAttributes(tieFormat);
  if (eventId) {
    event.tieFormat = prunedTieFormat;
    // NOTE: there is not a modifyEventNotice
  } else if (structure) {
    structure.tieFormat = prunedTieFormat;
  } else if (drawDefinition) {
    drawDefinition.tieFormat = prunedTieFormat;
  } else if (!matchUp || !drawDefinition) {
    return { error: MISSING_DRAW_DEFINITION };
  }

  modifyDrawNotice({ drawDefinition, eventId: event?.eventId });

  return { ...SUCCESS };
}
