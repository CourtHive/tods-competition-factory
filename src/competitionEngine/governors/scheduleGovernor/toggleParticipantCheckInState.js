import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { findMatchUp } from '../../../drawEngine/getters/getMatchUps/findMatchUp';
import { getCheckedInParticipantIds } from '../../../drawEngine/getters/matchUpTimeItems';
import {
  checkInParticipant,
  checkOutParticipant,
} from '../../../drawEngine/governors/matchUpGovernor/checkInStatus';
import {
  MATCHUP_NOT_FOUND,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function toggleParticipantCheckInState(params) {
  const { tournamentRecords } = params;
  const { participantId, tournamentId, matchUpId, drawId } = params;
  if (!tournamentRecords || !tournamentId || !participantId || !matchUpId)
    return { error: MISSING_VALUE };

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
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const { error, checkedInParticipantIds } = getCheckedInParticipantIds({
    matchUp,
  });
  if (error) return { error };

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
