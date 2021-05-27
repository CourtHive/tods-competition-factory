import { modifyMatchUpFormatTiming as modifyTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/modifyMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function modifyMatchUpFormatTiming({
  tournamentRecords,
  tournamentId,
  eventId,
  matchUpFormat,
  averageTimes,
  recoveryTimes,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

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
      return modifyTiming({
        tournamentRecord,
        event,

        matchUpFormat,
        averageTimes,
        recoveryTimes,
      });
    }
  }

  return { error: EVENT_NOT_FOUND };
}
