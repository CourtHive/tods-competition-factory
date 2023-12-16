import { removeEventExtension } from '../../extensions/addRemoveExtensions';
import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { findEvent } from '../../../acquire/findEvent';

import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';
import { Event, Tournament } from '../../../types/tournamentTypes';

type RemoveEventMatchUpFormatTimingArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  tournamentRecord?: Tournament;
  eventId: string;
  event?: Event;
};
export function removeEventMatchUpFormatTiming(
  params: RemoveEventMatchUpFormatTimingArgs
) {
  if (params.event) {
    const paramCheck = checkRequiredParameters(params, [{ eventId: true }]);
    if (paramCheck.error) return paramCheck;
    return removeTiming({ event: params.event });
  } else {
    if (params.tournamentRecord && !params.tournamentRecords) {
      params.tournamentRecords = {
        [params.tournamentRecord.tournamentId]: params.tournamentRecord,
      };
    }
    const paramCheck = checkRequiredParameters(params, [
      { tournamentRecords: true, eventId: true },
    ]);
    if (paramCheck.error) return paramCheck;

    const { tournamentRecords, eventId } = params;
    for (const tournamentRecord of Object.values(tournamentRecords ?? {})) {
      const { event } = findEvent({ tournamentRecord, eventId });
      if (event) return removeTiming({ event });
    }
  }

  return { error: EVENT_NOT_FOUND };
}

function removeTiming({ event }) {
  return removeEventExtension({ event, name: SCHEDULE_TIMING });
}
