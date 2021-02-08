import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { updateAssignmentParticipantResults } from './updateAssignmentParticipantResults';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addNotice } from '../../../global/globalState';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';

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
  drawDefinition,
  matchUpStatus,
  matchUpStatusCodes,
  matchUpFormat,
  winningSide,
  matchUp,
  score,

  removeScore,
}) {
  if (removeScore) {
    Object.assign(matchUp, toBePlayed);
  }
  if (score) matchUp.score = score;
  if (matchUpFormat) matchUp.matchUpFormat = matchUpFormat;
  if (matchUpStatus) matchUp.matchUpStatus = matchUpStatus;
  if (matchUpStatusCodes) matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (winningSide) matchUp.winningSide = winningSide;

  // middleware methods
  if (drawDefinition) {
    const { matchUpId } = matchUp;
    const { structure } = findMatchUp({
      drawDefinition,
      matchUpId,
    });

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
        positionAssignments: itemStructure.positionAssignments,
        matchUpFormat,
        matchUps,
      });
    }
  }

  addNotice({ topic: 'modifyMatchUp', payload: { matchUp } });
}
