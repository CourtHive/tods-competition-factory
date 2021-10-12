import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { scoreHasValue } from '../../../drawEngine/governors/matchUpGovernor/scoreHasValue';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { getTieMatchUpContext } from './getTieMatchUpContext';

import { EXISTING_OUTCOME } from '../../../constants/errorConditionConstants';
import { DOUBLES } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';

export function removeTieMatchUpParticipantId(params) {
  const { tournamentRecord, participantId } = params;

  const result = getTieMatchUpContext(params);
  if (result.error) return result;

  const {
    collectionPosition,
    collectionId,
    matchUpType,
    dualMatchUp,
    tieMatchUp,
  } = result;

  if (scoreHasValue({ score: tieMatchUp.score }) || tieMatchUp.winningSide)
    return { error: EXISTING_OUTCOME };

  const dualMatchUpSide = dualMatchUp.sides.find(
    (side) => side.sideNumber === params.sideNumber
  );
  const { modifiedLineUp } = removeCollectionAssignment({
    collectionPosition,
    dualMatchUpSide,
    participantId,
    collectionId,
  });
  dualMatchUpSide.lineUp = modifiedLineUp;

  if (matchUpType === DOUBLES) {
    const tieMatchUpSide = tieMatchUp.sides.find(
      (side) => side.sideNumber === params.sideNumber
    );

    const { participantId: pairParticipantId } = tieMatchUpSide;
    const {
      tournamentParticipants: [pairParticipant],
    } = getTournamentParticipants({
      tournamentRecord,
      participantFilters: {
        participantIds: [pairParticipantId],
      },
    });

    if (pairParticipant) {
      const individualParticipantIds =
        pairParticipant?.individualParticipantIds.filter(
          (currentId) => currentId !== participantId
        );
      if (individualParticipantIds.length) {
        pairParticipant.individualParticipantIds = individualParticipantIds;
        const result = modifyParticipant({
          participant: pairParticipant,
          pairOverride: true,
          tournamentRecord,
        });
        if (result.error) return result;
      } else {
        const result = deleteParticipants({
          participantIds: [pairParticipantId],
          tournamentRecord,
        });
        if (result.error) console.log('cleanup', { result });
      }
    } else {
      console.log('pair participant not found');
    }
  }

  return { ...SUCCESS, modifiedLineUp };
}

function removeCollectionAssignment({
  collectionPosition,
  dualMatchUpSide,
  participantId,
  collectionId,
}) {
  const modifiedLineUp = dualMatchUpSide.lineUp.map((teamCompetitor) => {
    if (teamCompetitor.particiapntId !== participantId) return teamCompetitor;
    const collectionAssignments = teamCompetitor.collectionAssignments?.filter(
      (assignment) => {
        const target =
          assignment.collectionId === collectionId &&
          assignment.collectionPosition === collectionPosition;
        return !target;
      }
    );
    return {
      participantId: teamCompetitor.participantId,
      collectionAssignments,
    };
  });
  return { modifiedLineUp };
}
