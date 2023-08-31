import { modifyPositionAssignmentsNotice } from '../../notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findStructure } from '../../getters/findStructure';
import { isActiveDownstream } from './isActiveDownstream';
import { randomMember } from '../../../utilities';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { DRAW } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { STRUCTURE_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { ResultType } from '../../../global/functions/decorateResult';

export function placeQualifier(
  params
): ResultType & { qualifierPlaced?: boolean } {
  let qualifierPlaced;
  const {
    inContextDrawMatchUps,
    inContextMatchUp,
    drawDefinition,
    winningSide,
  } = params;

  const winnerTargetLink = params.targetData.targetLinks?.winnerTargetLink;

  if (winnerTargetLink.target.feedProfile === DRAW) {
    const winningQualifierId = inContextMatchUp.sides.find(
      ({ sideNumber }) => sideNumber === winningSide
    )?.participantId;

    const mainDrawQualifierMatchUps = inContextDrawMatchUps.filter(
      (m) =>
        m.structureId === winnerTargetLink.target.structureId &&
        m.roundNumber === winnerTargetLink.target.roundNumber &&
        m.sides.some(
          ({ participantId, qualifier }) => qualifier && !participantId
        )
    );
    const mainDrawTargetMatchUp = randomMember(mainDrawQualifierMatchUps);
    if (mainDrawTargetMatchUp?.matchUpStatus === TO_BE_PLAYED) {
      const targetData = positionTargets({
        matchUpId: mainDrawTargetMatchUp.matchUpId,
        inContextDrawMatchUps,
        drawDefinition,
      });
      const activeDownstream = isActiveDownstream({
        inContextDrawMatchUps,
        drawDefinition,
        targetData,
      });
      if (!activeDownstream) {
        const targetDrawPosition = mainDrawTargetMatchUp.sides.find(
          (side) => side.qualifier && !side.participantId
        )?.drawPosition;
        const { structure } = findStructure({
          structureId: mainDrawTargetMatchUp.structureId,
          drawDefinition,
        });
        if (!structure) return { error: STRUCTURE_NOT_FOUND };
        const positionAssignments = getPositionAssignments({
          structure,
        }).positionAssignments;

        for (const positionAssignment of positionAssignments || []) {
          if (
            positionAssignment.drawPosition === targetDrawPosition &&
            !positionAssignment.participantId
          ) {
            positionAssignment.participantId = winningQualifierId;

            // update positionAssignments on structure
            if (structure.positionAssignments) {
              structure.positionAssignments = positionAssignments;
            } else if (structure.structures) {
              const assignmentMap = Object.assign(
                {},
                ...(positionAssignments || []).map((assignment) => ({
                  [assignment.drawPosition]: assignment.participantId,
                }))
              );
              for (const subStructure of structure.structures) {
                subStructure.positionAssignments?.forEach(
                  (assignment) =>
                    (assignment.participantId =
                      assignmentMap[assignment.drawPosition])
                );
              }
            }

            modifyPositionAssignmentsNotice({
              tournamentId: params.tournamentRecord?.tournamentId,
              event: params.event,
              drawDefinition,
              structure,
            });
            qualifierPlaced = true;
          }
        }
      }
    }
  }

  return { ...SUCCESS, qualifierPlaced };
}
