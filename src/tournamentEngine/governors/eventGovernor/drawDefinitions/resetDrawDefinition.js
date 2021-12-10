import { getAllStructureMatchUps } from '../../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { getMatchUpsMap } from '../../../../drawEngine/getters/getMatchUps/getMatchUpsMap';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';
import {
  MAIN,
  QUALIFYING,
} from '../../../../constants/drawDefinitionConstants';

export function resetDrawDefinition({ drawDefinition, removeScheduling }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  // for matchups in all structures:
  // remove all drawPositions which are not first round or fed
  // remove all extensions
  // if removeScheudling, remove all scheduling timeItems

  // for all structures which are NOT QUALIFYING or MAIN { stageSequence: 1 }
  // remove all positionAssignments that are not BYE

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  const getRawMatchUp = (matchUpId) =>
    matchUpsMap?.drawMatchUps?.find(
      (matchUp) => matchUp.matchUpId === matchUpId
    );

  for (const structure of drawDefinition.structures || []) {
    const { positionAssignments, stage, stageSequence } = structure;

    // reset positionAssignments and seedAssignments where appropriate
    if (
      positionAssignments &&
      (stageSequence !== 1 || ![QUALIFYING, MAIN].includes(stage))
    ) {
      structure.positionAssignments = positionAssignments.map((assignment) => {
        delete assignment.participantId;
        return assignment;
      });
      structure.seedAssignments = [];
    }

    const { matchUps: inContextMatchUps } = getAllStructureMatchUps({
      inContext: true,
      matchUpsMap,
      structure,
    });

    // reset all matchUps to initial state
    for (const inContextMatchUp of inContextMatchUps) {
      const { matchUpId, roundNumber, sides } = inContextMatchUp;
      const matchUp = getRawMatchUp(matchUpId);
      delete matchUp.extensions;
      delete matchUp.notes;

      if (matchUp.matchUpStatus !== BYE) {
        matchUp.matchUpStatus = TO_BE_PLAYED;
        delete matchUp.matchUpStatusCodes;
        delete matchUp.matchUpFormat;
        delete matchUp.winningSide;
        delete matchUp.score;
      }

      if (roundNumber && roundNumber > 1 && matchUp.drawPositions) {
        const fedDrawPositions = sides
          ?.map(
            ({ drawPosition, participantFed }) =>
              !participantFed && drawPosition
          )
          .filter(Boolean);
        matchUp.drawPositions = matchUp.drawPositions.map((drawPosition) =>
          !fedDrawPositions.includes(drawPosition) ? drawPosition : undefined
        );
      }

      if (removeScheduling) {
        delete matchUp.timeItems;
      } else if (matchUp.timeItems?.length) {
        matchUp.timeItems = matchUp.timeItems.filter(
          (timeItem) => ![].includes(timeItem.itemType)
        );
      }
    }
  }

  return { ...SUCCESS };
}
