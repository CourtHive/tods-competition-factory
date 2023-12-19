import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { checkOutParticipant } from './checkOutParticipant';
import { checkInParticipant } from './checkInParticipant';
import { findMatchUp } from '../../../acquire/findMatchUp';

import {
  MATCHUP_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function toggleParticipantCheckInState(params) {
  const tournamentId = params.tournamentId ?? params.activeTournamentId;
  const tournamentRecord =
    params.tournamentRecord ??
    (tournamentId && params.tournamentRecords?.[tournamentId]);

  const { participantId, matchUpId, drawDefinition, event } = params;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

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
      tournamentRecord,
      drawDefinition,
      participantId,
      matchUpId,
      matchUp,
    });
  } else {
    return checkInParticipant({
      tournamentRecord,
      drawDefinition,
      participantId,
      matchUpId,
      matchUp,
    });
  }
}
