import { getEventMatchUpFormatTiming as getTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getEventMatchUpFormatTiming';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

/**
 * method requires an array of target matchUpFormats either be defined in scoring policy or passed in as parameter
 *
 * @param {string[]} matchUpFormats - optional - array of targetd matchUpFormats
 * @param {string} eventId - resolved to { event } by tournamentEngine
 * @param {string} tournamentId - optional - optimization
 * @param {string} categoryType - optional filter
 *
 * @returns { eventMatchUpFormatTiming }
 */
export function getEventMatchUpFormatTiming({
  tournamentRecords,
  matchUpFormats,
  categoryType,
  tournamentId,
  eventId,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!eventId) return { error: MISSING_EVENT };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (currentTournamentId) =>
      !tournamentId || currentTournamentId === tournamentId
  );

  let timing;
  tournamentIds.find((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { event } = findEvent({ tournamentRecord, eventId });
    if (!event) return false;

    const { eventMatchUpFormatTiming } = getTiming({
      tournamentRecord,
      matchUpFormats,
      categoryType,
      event,
    });
    timing = eventMatchUpFormatTiming;
    return true;
  });

  return { eventMatchUpFormatTiming: timing };
}
