import { findEvent } from '../../../acquire/findEvent';
import { findTournamentId } from '../../../acquire/findTournamentId';
import { setMatchUpStatus as setStatus } from '../../../mutate/events/setMatchUpStatus';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function setMatchUpStatus(params) {
  const tournamentRecords = params.tournamentRecords;
  // find tournamentId by brute force if not provided
  const tournamentId = params.tournamentId || findTournamentId(params);
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition, event } = findEvent({
    eventId: params.eventId,
    drawId: params.drawId,
    tournamentRecord,
  });

  return setStatus({ tournamentRecord, ...params, drawDefinition, event });
}
