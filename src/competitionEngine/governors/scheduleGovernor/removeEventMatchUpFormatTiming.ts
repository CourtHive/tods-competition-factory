import { removeEventMatchUpFormatTiming as removeTiming } from '../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/removeEventMatchUpFormatTiming';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';

import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { Tournament } from '../../../types/tournamentFromSchema';

type RemoveEventMatchUpFormatTimingArgs = {
  tournamentRecords: { [key: string]: Tournament };
  eventId: string;
};
export function removeEventMatchUpFormatTiming({
  tournamentRecords,
  eventId,
}: RemoveEventMatchUpFormatTimingArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof eventId !== 'string')
    return { error: MISSING_VALUE, info: 'missing eventId' };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { event } = findEvent({ tournamentRecord, eventId });
    if (event) return removeTiming({ event });
  }

  return { error: EVENT_NOT_FOUND };
}
