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
          tournamentParticipants?.find(
            ({ participantId }) => participantId === teamParticipantId
          );

        const lineUp =
          side?.lineUp ||
          getTeamLineUp({
            participantId: teamParticipantId,
            drawDefinition,
          })?.lineUp;

        const relevantCompetitors = lineUp?.filter((teamCompetitor) => {
          return teamCompetitor.collectionAssignments.find(
            (assignment) =>
              assignment.collectionId === collectionId &&
              assignment.collectionPosition === collectionPosition
          );
        });

        if (matchUpType === DOUBLES) {
          if (relevantCompetitors?.length === 2) {
            const participantIds = relevantCompetitors?.map(getParticipantId);
            const { participant } = getPairedParticipant({
              tournamentParticipants,
              participantIds,
            });
            const participantId = participant?.participantId;
            return { [drawPosition]: { participantId, teamParticipant } };
          } else if (relevantCompetitors?.length > 2) {
            console.log('ERROR: Too many assignments for', {
              collectionId,
              collectionPosition,
              assignmentsCount: relevantCompetitors.length,
            });
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
