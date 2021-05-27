import { modifyMatchUpFormatTiming as modifyTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/modifyMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

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

    const result = modifyTiming({
      tournamentRecord,
      event,

      matchUpFormat,
      averageTimes,
      recoveryTimes,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}
