import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
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
    result = checkOutParticipant({ matchUpId, participantId });
  } else {
    result = checkInParticipant({ matchUpId, participantId });
  }
  return result;
}
