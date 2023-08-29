import { getEventMatchUpFormatTiming as getTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getEventMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  EVENT_NOT_FOUND,
  INVALID_VALUES,
  MISSING_EVENT,
} from '../../../../constants/errorConditionConstants';

/**
 * method requires an array of target matchUpFormats either be defined in scoring policy or passed in as parameter
 */
export function getEventMatchUpFormatTiming({
  tournamentRecords,
  matchUpFormats,
  categoryType,
  tournamentId,
  eventId,
}) {
  if (!eventId) return { error: MISSING_EVENT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || currentTournamentId === tournamentId
  );
  if (tournamentId && !tournamentIds.length) return { error: INVALID_VALUES };

  let timing;
  let timingError;
  let eventFound;
  tournamentIds.forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { event } = findEvent({ tournamentRecord, eventId });
    if (!event) return false;
    eventFound = true;

    const { eventMatchUpFormatTiming, error } = getTiming({
      tournamentRecord,
      matchUpFormats,
      categoryType,
      event,
    });
    if (error) timingError = error;
    timing = eventMatchUpFormatTiming;
    return undefined;
  });

  return (
    (!eventFound && { error: EVENT_NOT_FOUND }) ||
    (timingError && { error: timingError }) || {
      eventMatchUpFormatTiming: timing,
    }
  );
}
