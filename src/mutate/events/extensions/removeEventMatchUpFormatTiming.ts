import { checkRequiredParameters } from '../../../parameters/checkRequiredParameters';
import { removeEventExtension } from '../../extensions/addRemoveExtensions';
import { findEvent } from '../../../acquire/findEvent';

import { EVENT_ID, TOURNAMENT_RECORDS } from '../../../constants/attributeConstants';
import { EVENT_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';
import { Event, Tournament } from '../../../types/tournamentTypes';
import { TournamentRecords } from '../../../types/factoryTypes';

type RemoveEventMatchUpFormatTimingArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  eventId: string;
  event?: Event;
};
export function removeEventMatchUpFormatTiming(params: RemoveEventMatchUpFormatTimingArgs) {
  if (params.event) {
    return removeTiming({ event: params.event });
  } else {
    if (params.tournamentRecord && !params.tournamentRecords) {
      params.tournamentRecords = {
        [params.tournamentRecord.tournamentId]: params.tournamentRecord,
      };
    }
    const paramCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORDS]: true, [EVENT_ID]: true }]);
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
