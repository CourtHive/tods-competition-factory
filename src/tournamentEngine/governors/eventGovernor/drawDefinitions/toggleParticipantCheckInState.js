import { getCheckedInParticipantIds } from '../../../../drawEngine/getters/matchUpTimeItems';
import {
  checkInParticipant,
  checkOutParticipant,
} from '../../../../drawEngine/governors/matchUpGovernor/checkInStatus';
import { findMatchUp } from '../../../getters/matchUpsGetter';

export function toggleParticipantCheckInState(params) {
  const { tournamentRecord, participantId, matchUpId, drawDefinition } = params;
  const tournamentParticipants = tournamentRecord.participants || [];

  const { matchUp } = findMatchUp({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  const { checkedInParticipantIds } = getCheckedInParticipantIds({
    matchUp,
  });

  if (checkedInParticipantIds.includes(participantId)) {
    return checkOutParticipant({
      drawDefinition,
      tournamentParticipants,
      matchUpId,
      participantId,
    });
  } else {
    return checkInParticipant({
      drawDefinition,
      tournamentParticipants,
      matchUpId,
      participantId,
    });
  }
}
