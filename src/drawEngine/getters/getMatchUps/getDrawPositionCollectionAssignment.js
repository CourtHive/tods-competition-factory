import { getPairedParticipant } from '../../../tournamentEngine/governors/participantGovernor/getPairedParticipant';
import { getTeamLineUp } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/getTeamLineUp';
import { getParticipantId } from '../../../global/functions/extractors';

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

        // TODO: when there have been substitutions check substitutionOrder and previousParticipantId
        const relevantCompetitors = lineUp?.filter((teamCompetitor) => {
          return teamCompetitor.collectionAssignments?.find(
            (assignment) =>
              assignment.collectionId === collectionId &&
              assignment.collectionPosition === collectionPosition
          );
        });

        if (matchUpType === DOUBLES) {
          if (relevantCompetitors?.length <= 2) {
            const participantIds = relevantCompetitors?.map(getParticipantId);

            const pairedParticipantId =
              participantMap?.[participantIds[0]]?.pairIdMap?.[
                participantIds[1]
              ];
            const pairedParticipant =
              pairedParticipantId &&
              participantMap[pairedParticipantId]?.participant;
            const participant =
              pairedParticipant ||
              // resort to brute force
              getPairedParticipant({
                tournamentParticipants,
                participantIds,
              }).participant;

            const participantId = participant?.participantId;
            return { [drawPosition]: { participantId, teamParticipant } };
          } else if (relevantCompetitors?.length > 2) {
            /*
            console.log('ERROR: Too many assignments for', {
              assignmentsCount: relevantCompetitors.length,
              collectionPosition,
              collectionId,
            });
            */
            return { [drawPosition]: { teamParticipant } };
          }
        } else {
          const participantId = relevantCompetitors?.[0]?.participantId;

          return (
            participantId && {
              [drawPosition]: { participantId, teamParticipant },
            }
          );
        }
      })
      .filter(Boolean) || {};

  return Object.assign({}, ...drawPositionCollectionAssignment);
}
