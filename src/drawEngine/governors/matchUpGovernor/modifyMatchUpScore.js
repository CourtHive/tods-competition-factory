/**
 *
 * Single place where matchUp.score can be modified.
 * Moving forward this will be used for integrity checks and any middleware that needs to execute
 *
 * @param {*} param0
 */

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { addTimeItem } from '../../../tournamentEngine/governors/tournamentGovernor/addTimeItem';
import {
  findMatchUp,
  getAllStructureMatchUps,
} from '../../getters/getMatchUps';
import { tallyParticipantResults } from '../scoreGovernor/roundRobinTally';

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
