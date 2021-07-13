import { removeEventMatchUpFormatTiming as removeTiming } from '../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/removeEventMatchUpFormatTiming';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';

import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function removeEventMatchUpFormatTiming({ tournamentRecords, eventId }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof eventId !== 'string') return { error: MISSING_VALUE };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { event } = findEvent({ tournamentRecord, eventId });
    if (event) return removeTiming({ event });
  }

  return { error: EVENT_NOT_FOUND };
}
