import { addExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { tallyParticipantResults } from '../scoreGovernor/roundRobinTally/roundRobinTally';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { findExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import { instanceCount } from '../../../utilities';

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

      const subOrderArray = (itemStructure.positionAssignments || [])
        .filter(({ participantId }) => participantId)
        .map((assignment) => {
          const { extension } = findExtension({
            element: assignment,
            name: 'subOrder',
          });
          const subOrder = extension?.value;
          return (
            subOrder && { particpantId: assignment.participantId, subOrder }
          );
        })
        .filter((f) => f);

      // we only want subOrders that are unique, and we want them sorted and re-assigned to ordered values
      const subOrders = subOrderArray.map(({ subOrder }) => subOrder);
      const subOrdersCount = instanceCount(subOrders);
      const subOrderMap = Object.assign(
        {},
        ...subOrderArray
          .filter(({ subOrder }) => subOrdersCount[subOrder] === 1)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ participantId }, index) => ({
            [participantId]: index + 1,
          }))
      );

      const { participantResults } = tallyParticipantResults({
        matchUpFormat,
        subOrderMap,
        matchUps,
      });
      Object.keys(participantResults).forEach((participantId) => {
        const assignment = itemStructure.positionAssignments.find(
          (assignment) => assignment.participantId === participantId
        );
        let extension = {
          name: 'tally',
          value: participantResults[participantId],
        };
        addExtension({ element: assignment, extension });
        extension = {
          name: 'subOrder',
          value: participantResults[participantId].subOrder,
        };
        addExtension({ element: assignment, extension });
      });
    }
  }
}
