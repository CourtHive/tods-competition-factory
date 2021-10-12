import { getTieMatchUpContext } from './getTieMatchUpContext';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function replaceTieMatchUpParticipantId(params) {
  const result = getTieMatchUpContext(params);
  if (result.error) return result;

  const { existingParticipantId, newParticipantId } = params;
  if (!existingParticipantId || !newParticipantId)
    return { error: MISSING_PARTICIPANT_ID };

  const { collectionPosition, collectionId, dualMatchUp, tieMatchUp } = result;

  const side = tieMatchUp.sides.find(
    (side) =>
      side.participant?.participantId === existingParticipantId ||
      side.participant?.individualParticipantIds?.includes(
        existingParticipantId
      )
  );
  if (!side) return { error: PARTICIPANT_NOT_FOUND };

  const dualMatchUpSide = dualMatchUp.sides.find(
    ({ sideNumber }) => sideNumber === side.sideNumber
  );

  let newParticipantIdInLineUp;
  const modifiedLineUp = dualMatchUpSide.lineUp.map((teamCompetitor) => {
    if (
      ![existingParticipantId, newParticipantId].includes(
        teamCompetitor.participantId
      )
    ) {
      return teamCompetitor;
    }

    if (
      [existingParticipantId, newParticipantId].includes(
        teamCompetitor.participantId
      )
    ) {
      const collectionAssignments =
        teamCompetitor.collectionAssignments?.filter((assignment) => {
          const target =
            assignment.collectionId === collectionId &&
            assignment.collectionPosition === collectionPosition;
          return !target;
        });
      return {
        participantId: teamCompetitor.participantId,
        collectionAssignments,
      };
    }

    if (teamCompetitor.participantId === newParticipantId) {
      newParticipantIdInLineUp = true;
      if (!teamCompetitor.collectionAssignments)
        teamCompetitor.collectionAssignments = [];
      teamCompetitor.collectionAssignments.push({
        collectionId,
        collectionPosition,
      });
      return teamCompetitor;
    }
  });

  if (!newParticipantIdInLineUp) {
    modifiedLineUp.push({
      participantId: newParticipantId,
      collectionAssignments: [{ collectionId, collectionPosition }],
    });
  }

  dualMatchUpSide.lineUp = modifiedLineUp;

  // now check whether new pairParticipant exists

  return { ...SUCCESS };
}
