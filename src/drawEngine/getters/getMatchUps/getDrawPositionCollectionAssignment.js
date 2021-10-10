import { getPairedParticipant } from '../../../tournamentEngine/governors/participantGovernor/getPairedParticipant';
import { getParticipantId } from '../../../global/functions/extractors';

import { DOUBLES } from '../../../constants/matchUpTypes';

export function getDrawPositionCollectionAssignment({
  tournamentParticipants,
  collectionPosition,
  drawPositions = [],
  collectionId,
  sideLineUps,
  matchUpType,
}) {
  if (!collectionId || !collectionPosition) return;

  const drawPositionCollectionAssignment = drawPositions
    ?.map((drawPosition) => {
      const side = sideLineUps?.find(
        (lineUp) => lineUp.drawPosition === drawPosition
      );

      const lineUp = side?.lineUp;
      const teamParticipant = side?.teamParticipant;

      const relevantCompetitors = lineUp?.filter((teamCompetitor) => {
        return teamCompetitor.collectionAssignments.find(
          (assignment) =>
            assignment.collectionId === collectionId &&
            assignment.collectionPosition === collectionPosition
        );
      });

      if (matchUpType === DOUBLES || relevantCompetitors?.length === 2) {
        const participantIds = relevantCompetitors?.map(getParticipantId);
        const { participant } = getPairedParticipant({
          tournamentParticipants,
          participantIds,
        });
        const participantId = participant?.participantId;
        return { [drawPosition]: { participantId, teamParticipant } };
      }

      const participantId = relevantCompetitors?.[0]?.participantId;

      return (
        participantId && {
          [drawPosition]: { participantId, teamParticipant },
        }
      );
    })
    .filter(Boolean);

  return Object.assign({}, ...drawPositionCollectionAssignment);
}
