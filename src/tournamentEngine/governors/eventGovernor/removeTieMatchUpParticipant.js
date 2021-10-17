import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { scoreHasValue } from '../../../drawEngine/governors/matchUpGovernor/scoreHasValue';
import { deleteParticipants } from '../participantGovernor/deleteParticipants';
import { modifyParticipant } from '../participantGovernor/modifyParticipant';
import { removeCollectionAssignments } from './removeCollectionAssignments';
import { getTieMatchUpContext } from './getTieMatchUpContext';

import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { INDIVIDUAL, PAIR } from '../../../constants/participantTypes';
import {
  EXISTING_OUTCOME,
  INVALID_PARTICIPANT,
  MISSING_PARTICIPANT_ID,
  NOT_FOUND,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function removeTieMatchUpParticipantId(params) {
  const { tournamentRecord, participantId } = params;

  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

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

  const {
    tournamentParticipants: [participantToRemove],
  } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: {
      participantIds: [participantId],
    },
  });

  if (!participantToRemove) {
    return { error: PARTICIPANT_NOT_FOUND };
  }

  if (matchUpType === SINGLES && participantToRemove.participantType === PAIR) {
    return { error: INVALID_PARTICIPANT };
  }

  const participantIds =
    participantToRemove.participantType === INDIVIDUAL
      ? [participantId]
      : participantToRemove.individualParticipantIds;

  const dualMatchUpSide = dualMatchUp.sides?.find((side) =>
    side.lineUp?.find((teamCompetitor) =>
      participantIds.includes(teamCompetitor.participantId)
    )
  );

  if (!dualMatchUpSide) {
    return { error: NOT_FOUND, participantId };
  }

  const { modifiedLineUp } = removeCollectionAssignments({
    collectionPosition,
    dualMatchUpSide,
    participantIds,
    collectionId,
  });

  dualMatchUpSide.lineUp = modifiedLineUp;

  // if an INDIVIDUAL participant is being removed from a DOUBLES matchUp
  // ...then the PAIR participant may need to be modified
  if (
    matchUpType === DOUBLES &&
    participantToRemove.participantType === INDIVIDUAL
  ) {
    const tieMatchUpSide = tieMatchUp.sides.find(
      (side) => side.sideNumber === dualMatchUpSide.sideNumber
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
        // CHECK - don't modify pair participant that is part of other events/draws
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
