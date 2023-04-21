import { modifyPositionAssignmentsNotice } from '../../notifications/drawNotifications';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { checkConnectedStructures } from './checkConnectedStructures';
import { positionTargets } from '../positionGovernor/positionTargets';
import { definedAttributes } from '../../../utilities/objects';
import { attemptToModifyScore } from './attemptToModifyScore';
import { findStructure } from '../../getters/findStructure';
import { directParticipants } from './directParticipants';
import { isActiveDownstream } from './isActiveDownstream';

import { POLICY_TYPE_PROGRESSION } from '../../../constants/policyConstants';
import { TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { DRAW } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function attemptToSetWinningSide(params) {
  const stack = 'attemptToSetWinningSide';
  let connectedStructures;

  const {
    qualifierChanging,
    appliedPolicies,
    disableAutoCalc,
    drawDefinition,
    matchUpsMap,
    dualMatchUp,
    winningSide,
    structure,
    matchUp,
  } = params;

  // disableAutoCalc means the score is being set manually
  if (dualMatchUp?._disableAutoCalc && disableAutoCalc !== false) {
    return attemptToModifyScore(params);
  }

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    // only applies when progression is based on WIN_RATIO, e.g. ROUND_ROBIN_WITH_PLAYOFF
    const { connectedStructureIds } = checkConnectedStructures({
      drawDefinition,
      matchUpsMap,
      structure,
      matchUp,
    });
    if (connectedStructureIds.length) {
      // TODO: return a message if there are effects in connected structures
      console.log({ connectedStructureIds });
      connectedStructures = true;
    }

    const result = removeDirectedParticipants(params);

    if (result.error) return result;
  }

  const result = directParticipants(params);
  if (result.error) return decorateResult({ result, stack });

  let qualifierReplaced;
  if (
    qualifierChanging &&
    appliedPolicies?.[POLICY_TYPE_PROGRESSION]?.autoReplaceQualifiers
  ) {
    qualifierReplaced = replaceQualifier(params).qualifierReplaced;
  }

  return decorateResult({
    result: definedAttributes({
      connectedStructures,
      qualifierReplaced,
      ...SUCCESS,
    }),
    stack,
  });
}

function replaceQualifier(params) {
  const stack = 'replaceQualifier';
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
        for (const positionAssignment of positionAssignments) {
          if (
            positionAssignment.participantId === previousWinningParticipantId
          ) {
            const newWinningParticipantId = inContextMatchUp.sides.find(
              ({ sideNumber }) => sideNumber === winningSide
            ).participantId;
            positionAssignment.participantId = newWinningParticipantId;

            // update positionAssignments on structure
            if (structure.positionAssignments) {
              structure.positionAssignments = positionAssignments;
            } else if (structure.structures) {
              const assignmentMap = Object.assign(
                {},
                ...positionAssignments.map((assignment) => ({
                  [assignment.drawPosition]: assignment.participantId,
                }))
              );
              for (const subStructure of structure.structures) {
                subStructure.positionAssignments.forEach(
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
              source: stack,
              structure,
            });
            qualifierReplaced = true;
          }
        }
      }
    }
  }

  return { qualifierReplaced };
}
