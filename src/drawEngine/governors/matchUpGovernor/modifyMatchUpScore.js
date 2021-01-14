import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import {
  findMatchUp,
  getAllStructureMatchUps,
} from '../../getters/getMatchUps';
import { tallyParticipantResults } from '../scoreGovernor/roundRobinTally';
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
  matchUp,
  score,
  matchUpStatus,
  matchUpStatusCodes,
  matchUpFormat,
  winningSide,
}) {
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
      const { participantResults } = tallyParticipantResults({
        matchUps,
        matchUpFormat,
      });
      Object.keys(participantResults).forEach((participantId) => {
        const assignment = itemStructure.positionAssignments.find(
          (assignment) => assignment.participantId === participantId
        );
        const extension = {
          name: 'tally',
          value: participantResults[participantId],
        };
        addExtension({ element: assignment, extension });
      });
    }
  }
}
