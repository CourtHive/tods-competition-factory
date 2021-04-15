import { getCheckedInParticipantIds } from '../../../../drawEngine/getters/matchUpTimeItems';
import {
  checkInParticipant,
  checkOutParticipant,
} from '../../../../drawEngine/governors/matchUpGovernor/checkInStatus';
import { findMatchUp } from '../../../getters/matchUpsGetter';

import { MATCHUP_NOT_FOUND } from '../../../../constants/errorConditionConstants';

export function toggleParticipantCheckInState(params) {
  const { tournamentRecord, participantId, matchUpId, drawDefinition } = params;
  const tournamentParticipants = tournamentRecord.participants || [];

  const { matchUp } = findMatchUp({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  const { error, checkedInParticipantIds } = getCheckedInParticipantIds({
    matchUp,
  });
  if (error) return { error };

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
