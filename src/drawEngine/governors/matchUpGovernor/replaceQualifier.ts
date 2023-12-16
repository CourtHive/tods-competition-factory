import { modifyPositionAssignmentsNotice } from '../../../mutate/notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../../../mutate/matchUps/drawPositions/positionTargets';
import { findStructure } from '../../getters/findStructure';
import { isActiveDownstream } from './isActiveDownstream';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { DRAW } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function replaceQualifier(params) {
  let qualifierReplaced;
  const {
    inContextDrawMatchUps,
    inContextMatchUp,
    drawDefinition,
    winningSide,
  } = params;

  const winnerTargetLink = params.targetData.targetLinks?.winnerTargetLink;

  if (winnerTargetLink.target.feedProfile === DRAW) {
    const previousWinningParticipantId = inContextMatchUp.sides.find(
      ({ sideNumber }) => sideNumber !== winningSide
    ).participantId;
    const mainDrawTargetMatchUp = inContextDrawMatchUps.find(
      (m) =>
        m.structureId === winnerTargetLink.target.structureId &&
        m.roundNumber === winnerTargetLink.target.roundNumber &&
        m.sides.some(
          ({ participantId }) => participantId === previousWinningParticipantId
        )
    );
    if (mainDrawTargetMatchUp?.matchUpStatus === TO_BE_PLAYED) {
      // prevoius winningSide participant was placed in MAIN
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
        const { structure } = findStructure({
          structureId: mainDrawTargetMatchUp.structureId,
          drawDefinition,
        });
        const positionAssignments = getPositionAssignments({
          structure,
        }).positionAssignments;
        for (const positionAssignment of positionAssignments || []) {
          if (
            positionAssignment.participantId === previousWinningParticipantId
          ) {
            const newWinningParticipantId = inContextMatchUp.sides.find(
              ({ sideNumber }) => sideNumber === winningSide
            ).participantId;
            positionAssignment.participantId = newWinningParticipantId;

            // update positionAssignments on structure
            if (structure?.positionAssignments) {
              structure.positionAssignments = positionAssignments;
            } else if (structure?.structures) {
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
            qualifierReplaced = true;
          }
        }
      }
    }
  }

  return { ...SUCCESS, qualifierReplaced };
}
