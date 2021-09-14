import { getCheckedInParticipantIds } from '../../../../drawEngine/getters/matchUpTimeItems';
import { findMatchUp } from '../../../getters/matchUpsGetter';
import {
  checkInParticipant,
  checkOutParticipant,
} from '../../../../drawEngine/governors/matchUpGovernor/checkInStatus';

import {
  MATCHUP_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function toggleParticipantCheckInState(params) {
  if (!params?.tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const { tournamentRecord, participantId, matchUpId, drawDefinition } = params;
  const tournamentParticipants = tournamentRecord.participants || [];

  const { matchUp } = findMatchUp({
    tournamentRecord,
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };
  const { checkedInParticipantIds = [] } = getCheckedInParticipantIds({
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
