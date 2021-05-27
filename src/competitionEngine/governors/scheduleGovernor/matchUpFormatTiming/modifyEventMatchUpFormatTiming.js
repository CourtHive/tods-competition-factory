import { modifyEventMatchUpFormatTiming as modifyEventTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/modifyEventMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function modifyEventMatchUpFormatTiming({
  tournamentRecords,
  tournamentId,
  eventId,

  matchUpFormat,
  averageMinutes,
  recoveryMinutes,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!eventId) return { error: MISSING_EVENT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || tournamentId === currentTournamentId
  );

  if (tournamentId && !tournamentIds.includes(tournamentId))
    return { error: INVALID_VALUES };

  for (const currentTournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const { event } = findEvent({ tournamentRecord, eventId });
    if (event) {
      return modifyEventTiming({
        tournamentRecord,
        event,
        matchUpFormat,
        averageMinutes,
        recoveryMinutes,
      });
    }
  }

  return { error: EVENT_NOT_FOUND };
}
