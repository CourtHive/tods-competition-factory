import { modifyMatchUpFormatTiming as modifyTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/modifyMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function modifyMatchUpFormatTiming({
  tournamentRecords,
  matchUpFormat,
  recoveryTimes,
  averageTimes,
  tournamentId,
  eventId,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || tournamentId === currentTournamentId
  );

  if (tournamentId && !tournamentIds.includes(tournamentId))
    return { error: INVALID_VALUES };

  let eventModified;
  for (const currentTournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[currentTournamentId];
    const { event } = findEvent({ tournamentRecord, eventId });
    if (eventId && event) eventModified = true;

    const result = modifyTiming({
      tournamentRecord,
      event,

      matchUpFormat,
      averageTimes,
      recoveryTimes,
    });
    if (result.error) return result;
  }

  return !eventId || eventModified
    ? { ...SUCCESS }
    : { error: EVENT_NOT_FOUND };
}
