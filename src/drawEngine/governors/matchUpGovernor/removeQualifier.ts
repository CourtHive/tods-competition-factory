import { modifyPositionAssignmentsNotice } from '../../notifications/drawNotifications';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findStructure } from '../../getters/findStructure';
import { isActiveDownstream } from './isActiveDownstream';

import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { ResultType } from '../../../global/functions/decorateResult';
import { DRAW } from '../../../constants/drawDefinitionConstants';
import { HydratedMatchUp } from '../../../types/hydrated';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentFromSchema';

type RemoveQualifierArgs = {
  inContextDrawMatchUps: HydratedMatchUp[];
  inContextMatchUp: HydratedMatchUp;
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  targetData: any;
  event?: Event;
};
export function removeQualifier(
  params: RemoveQualifierArgs
): ResultType & { qualifierRemoved?: boolean } {
  let qualifierRemoved;
  const { inContextDrawMatchUps, inContextMatchUp, drawDefinition } = params;

  const winnerTargetLink = params.targetData.targetLinks?.winnerTargetLink;

  if (winnerTargetLink.target.feedProfile === DRAW) {
    const previousWinningParticipantId = inContextMatchUp.sides?.find(
      ({ sideNumber }) => sideNumber === inContextMatchUp.winningSide
    )?.participantId;
    const mainDrawTargetMatchUp = inContextDrawMatchUps.find(
      (m) =>
        m.structureId === winnerTargetLink.target.structureId &&
        m.roundNumber === winnerTargetLink.target.roundNumber &&
        m.sides?.some(
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
            positionAssignment.participantId = undefined;

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

              for (const subStructure of structure?.structures || []) {
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
            qualifierRemoved = true;
          }
        }
      }
    }
  }

  return { qualifierRemoved };
}
