import { addNotes } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveNotes';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { updateAssignmentParticipantResults } from './updateAssignmentParticipantResults';
import { getFlightProfile } from '../../../tournamentEngine/getters/getFlightProfile';
import { decorateResult } from '../../../global/functions/decorateResult';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  AWAITING_RESULT,
  completedMatchUpStatuses,
  DOUBLE_WALKOVER,
  IN_PROGRESS,
  SUSPENDED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

/**
 *
 * Single place where matchUp.score can be modified.
 *
 * Mutates passed matchUp object.
 * Moving forward this will be used for integrity checks and any middleware that needs to execute
 *
 * @param {object} drawDefinition
 * @param {object} matchUp
 * @param {object} score
 * @param {string} matchUpStatus - e.g. COMPLETED, BYE, TO_BE_PLAYED, WALKOVER, DEFAULTED
 * @param {string[]} matchUpStatusCodes - optional - organization specific
 * @param {number} winningSide - optional - 1 or 2
 */

export function modifyMatchUpScore({
  matchUpStatusCodes,
  removeWinningSide,
  tournamentRecord,
  drawDefinition,
  matchUpFormat,
  matchUpStatus,
  removeScore,
  winningSide,
  matchUpId,
  matchUp, // matchUp without context
  event,
  notes,
  score,
}) {
  const stack = 'modifyMatchUpScore';
  let structure;

  const isDualMatchUp = matchUp.matchUpType === TEAM;

  if (isDualMatchUp) {
    if (matchUpId && matchUp.matchUpId !== matchUpId) {
      // the modification is to be applied to a tieMatchUp
      ({ matchUp, structure } = findMatchUp({
        drawDefinition,
        matchUpId,
        event,
      }));
    } else {
      // the modification is to be applied to the TEAM matchUp
    }
  } else {
    if (matchUp.matchUpId !== matchUpId) console.log('!!!!!');
  }

  if (
    (matchUpStatus && [WALKOVER, DOUBLE_WALKOVER].includes(matchUpStatus)) ||
    removeScore
  ) {
    Object.assign(matchUp, { ...toBePlayed });
  } else if (score) {
    matchUp.score = score;
  }
  if (matchUpStatus) matchUp.matchUpStatus = matchUpStatus;
  if (matchUpFormat) matchUp.matchUpFormat = matchUpFormat;
  if (matchUpStatusCodes) matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (winningSide) matchUp.winningSide = winningSide;
  if (removeWinningSide) matchUp.winningSide = undefined;

  if (!structure) {
    ({ structure } = findMatchUp({
      drawDefinition,
      matchUpId,
      event,
    }));
  }

  if (
    scoreHasValue(matchUp) &&
    !completedMatchUpStatuses.includes(matchUpStatus) &&
    ![AWAITING_RESULT, SUSPENDED].includes(matchUpStatus)
  ) {
    matchUp.matchUpStatus = IN_PROGRESS;
  }

  // if the matchUp has a collectionId it is a tieMatchUp contained in a dual matchUp
  if (structure?.structureType === CONTAINER && !matchUp.collectionId) {
    matchUpFormat = isDualMatchUp
      ? 'SET1-S:T100'
      : matchUpFormat ||
        matchUp.matchUpFormat ||
        structure?.matchUpFormat ||
        drawDefinition.matchUpFormat ||
        event?.matchUpFormat;

    const itemStructure = structure.structures.find((itemStructure) => {
      return itemStructure?.matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );
    });

    const matchUpFilters = isDualMatchUp && { matchUpTypes: [TEAM] };
    const { matchUps } = getAllStructureMatchUps({
      afterRecoveryTimes: false,
      structure: itemStructure,
      inContext: true,
      matchUpFilters,
      event,
    });

    const result = updateAssignmentParticipantResults({
      positionAssignments: itemStructure.positionAssignments,
      tournamentRecord,
      drawDefinition,
      matchUpFormat,
      matchUps,
      event,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  const winningSideChanged = winningSide !== matchUp.winningSide;
  if (winningSideChanged) {
    const { flightProfile } = getFlightProfile({ event });
    const flight = flightProfile?.flights?.find(
      (flight) => flight.drawId === drawDefinition.drawId
    );
    if (flight?.matchUpValue) {
      console.log('recalculate team point tallies');
    }
  }

  if (notes) {
    const result = addNotes({ element: matchUp, notes });
    if (result.error) return decorateResult({ result, stack });
  }

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    context: stack,
    drawDefinition,
    matchUp,
  });

  return { ...SUCCESS };
}
