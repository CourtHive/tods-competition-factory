import { getCollectionPositionAssignments } from '../../../tournamentEngine/governors/eventGovernor/getCollectionPositionAssignments';
import { getPairedParticipant } from '../../../tournamentEngine/governors/participantGovernor/getPairedParticipant';
import { getTeamLineUp } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/getTeamLineUp';

import { DOUBLES } from '../../../constants/matchUpTypes';

export function getDrawPositionCollectionAssignment({
  tournamentParticipants,
  positionAssignments,
  collectionPosition,
  drawPositions = [],
  drawDefinition,
  participantMap,
  collectionId,
  sideLineUps,
  matchUpType,
}) {
  if (!collectionId || !collectionPosition) return;

  const drawPositionCollectionAssignment =
    drawPositions
      ?.map((drawPosition) => {
        const teamParticipantId = positionAssignments.find(
          (assignment) => assignment.drawPosition === drawPosition
        )?.participantId;

        const side = sideLineUps?.find(
          (lineUp) => lineUp?.drawPosition === drawPosition
        );

        const teamParticipant =
          side?.teamParticipant ||
          participantMap?.[teamParticipantId]?.participant ||
          tournamentParticipants?.find(
            ({ participantId }) => participantId === teamParticipantId
          );

        const lineUp =
          side?.lineUp ||
          getTeamLineUp({
            participantId: teamParticipantId,
            drawDefinition,
          })?.lineUp;

        const { assignedParticipantIds, substitutions } =
          getCollectionPositionAssignments({
            collectionPosition,
            collectionId,
            lineUp,
          });

        if (matchUpType === DOUBLES) {
          if (assignedParticipantIds?.length <= 2) {
            const pairedParticipantId =
              participantMap?.[assignedParticipantIds[0]]?.pairIdMap?.[
                assignedParticipantIds[1]
              ];
            const pairedParticipant =
              pairedParticipantId &&
              participantMap[pairedParticipantId]?.participant;
            const participant =
              pairedParticipant ||
              // resort to brute force
              getPairedParticipant({
                participantIds: assignedParticipantIds,
                tournamentParticipants,
              }).participant;

            const participantId = participant?.participantId;
            return {
              [drawPosition]: { participantId, teamParticipant, substitutions },
            };
          } else if (assignedParticipantIds?.length > 2) {
            /*
            console.log('ERROR: Too many assignments for', {
              assignmentsCount: relevantCompetitors.length,
              collectionPosition,
              collectionId,
            });
            */
            return { [drawPosition]: { teamParticipant, substitutions } };
          }
        } else {
          const participantId = assignedParticipantIds?.[0];

          return (
            participantId && {
              [drawPosition]: { participantId, teamParticipant, substitutions },
            }
          );
        }
      })
      .filter(Boolean) || {};

  return Object.assign({}, ...drawPositionCollectionAssignment);
}
