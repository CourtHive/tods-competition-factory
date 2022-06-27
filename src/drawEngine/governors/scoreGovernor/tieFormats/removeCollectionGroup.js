import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../../tournamentEngine/getters/matchUpsGetter';
import { getTieFormat } from '../../../../tournamentEngine/getters/getTieFormat';
import { modifyMatchUpNotice } from '../../../notifications/drawNotifications';
import { calculateWinCriteria } from './calculateWinCriteria';
import { validateTieFormat } from './tieFormatUtilities';
import { scoreHasValue } from '../scoreHasValue';
import { copyTieFormat } from './copyTieFormat';

import { MISSING_VALUE } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';
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
      structure,
    })?.matchUps;
  } else if (drawDefinition) {
    matchUps = allDrawMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      drawDefinition,
    })?.matchUps;
  }

  // all team matchUps in scope which are completed or which have a tieFormat should not be modified
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      !matchUp.tieFormat &&
      ![COMPLETED, IN_PROGRESS].includes(matchUp.matchUpStatus) &&
      !matchUp.winningSide &&
      !(!updateInProgressMatchUps && scoreHasValue(matchUp))
  );

  for (const matchUp of targetMatchUps) {
    if (matchUp.tieFormat) matchUp.tieFormat = copyTieFormat(tieFormat);

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      drawDefinition,
      matchUp,
    });
  }

  return { ...SUCCESS };
}
