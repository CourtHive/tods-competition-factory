import { getCheckedInParticipantIds } from '../../../../drawEngine/getters/matchUpTimeItems';
import { findMatchUp } from '../../../getters/matchUpsGetter/findMatchUp';
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
  const { tournamentRecord, participantId, matchUpId, drawDefinition, event } =
    params;
  const tournamentParticipants = tournamentRecord.participants || [];

  const result = findMatchUp({
    tournamentRecord,
    inContext: true,
    drawDefinition,
    matchUpId,
    event,
  });
  if (!result.matchUp) return { error: MATCHUP_NOT_FOUND };

  const matchUp = result.matchUp;

  const { checkedInParticipantIds = [] } = getCheckedInParticipantIds({
    matchUp,
  });

  if (checkedInParticipantIds.includes(participantId)) {
    return checkOutParticipant({
      tournamentParticipants,
      tournamentRecord,
      drawDefinition,
      participantId,
      matchUpId,
      matchUp,
    });
  } else {
    return checkInParticipant({
      tournamentParticipants,
      tournamentRecord,
      drawDefinition,
      participantId,
      matchUpId,
      matchUp,
    });
  }
}
