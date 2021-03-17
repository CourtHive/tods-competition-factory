import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { getCheckedInParticipantIds } from '../../../drawEngine/getters/matchUpTimeItems';
import {
  checkInParticipant,
  checkOutParticipant,
} from '../../../drawEngine/governors/matchUpGovernor/checkInStatus';

export function toggleParticipantCheckInState(params) {
  const { tournamentRecords } = params;
  const { participantId, tournamentId, matchUpId, drawId } = params;

  const tournamentRecord = tournamentRecords[tournamentId];
  const tournamentParticipants = tournamentRecord?.participants;
  const { drawDefinition } = getDrawDefinition({
    tournamentRecord,
    drawId,
  });
  const { matchUp } = findMatchUp({
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  const { checkedInParticipantIds } = getCheckedInParticipantIds({
    matchUp,
  });

  let result;
  if (checkedInParticipantIds.includes(participantId)) {
    result = checkOutParticipant({
      tournamentParticipants,
      drawDefinition,
      matchUpId,
      participantId,
    });
  } else {
    result = checkInParticipant({
      tournamentParticipants,
      drawDefinition,
      matchUpId,
      participantId,
    });
  }
  return result;
}
