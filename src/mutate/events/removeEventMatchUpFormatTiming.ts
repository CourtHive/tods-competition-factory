import { removeEventMatchUpFormatTiming as removeTiming } from './extensions/removeEventMatchUpFormatTiming';
import { checkRequiredParameters } from '../../parameters/checkRequiredParameters';
import { findEvent } from '../../acquire/findEvent';

import { EVENT_NOT_FOUND } from '../../constants/errorConditionConstants';
import { Tournament } from '../../types/tournamentTypes';

type RemoveEventMatchUpFormatTimingArgs = {
  tournamentRecords: { [key: string]: Tournament };
  eventId: string;
};
export function removeEventMatchUpFormatTiming(
  params: RemoveEventMatchUpFormatTimingArgs
) {
  const paramCheck = checkRequiredParameters(params, [
    { tournamentRecords: true, eventId: true },
  ]);
  if (paramCheck.error) return paramCheck;

  const { tournamentRecords, eventId } = params;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { event } = findEvent({ tournamentRecord, eventId });
    if (event) return removeTiming({ event });
  }

  return { error: EVENT_NOT_FOUND };
}
