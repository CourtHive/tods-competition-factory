import { addNotes } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveNotes';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { updateAssignmentParticipantResults } from './updateAssignmentParticipantResults';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addNotice } from '../../../global/globalState';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';

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
  tournamentRecord,
  drawDefinition,
  event,

  matchUpStatus,
  matchUpStatusCodes,
  matchUpFormat,
  winningSide,
  matchUpId,
  matchUp,
  score,
  notes,

  removeScore,
  removeWinningSide,
}) {
  let structure;

  if (matchUp.matchUpType === TEAM) {
    if (matchUpId && matchUp.matchUpId !== matchUpId) {
      // the modification is to be applied to a tieMatchUp
      ({ matchUp, structure } = findMatchUp({ drawDefinition, matchUpId }));
    } else {
      // the modification is to be applied to the TEAM matchUp
    }
  } else {
    if (matchUp.matchUpId !== matchUpId) console.log('!!!!!');
  }

  if (removeScore) {
    Object.assign(matchUp, toBePlayed);
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
    }));
  }

  if (structure?.structureType === CONTAINER) {
    matchUpFormat =
      matchUpFormat ||
      matchUp.matchUpFormat ||
      structure?.matchUpFormat ||
      drawDefinition.matchUpFormat;

    const itemStructure = structure.structures.find((itemStructure) => {
      return itemStructure?.matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );
    });

    const { matchUps } = getAllStructureMatchUps({
      structure: itemStructure,
      inContext: true,
    });

    updateAssignmentParticipantResults({
      tournamentRecord,
      drawDefinition,
      event,

      positionAssignments: itemStructure.positionAssignments,
      matchUpFormat,
      matchUps,
    });
  }

  if (notes) {
    addNotes({ element: matchUp, notes });
  }

  addNotice({ topic: MODIFY_MATCHUP, payload: { matchUp } });

  return SUCCESS;
}
