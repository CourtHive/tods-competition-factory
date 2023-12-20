import { findEvent } from '../../../acquire/findEvent';
import { getTournamentId } from '../../../global/state/globalState';

import { TournamentRecords } from '../../../types/factoryTypes';
import {
  EVENT_NOT_FOUND,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function paramsMiddleware(
  tournamentRecords: TournamentRecords,
  params: { [key: string]: any }
) {
  if (params._middleware === false) return params;

  // first check validity of params.tournamentId, if present
  if (params.tournamentId && !tournamentRecords[params.tournamentId]) {
    return { error: MISSING_TOURNAMENT_RECORD };
  }

  const drawId = params.drawId || params.matchUp?.drawId;

  if (drawId) {
    const { event, drawDefinition, tournamentId } = findEvent({
      tournamentRecords,
      drawId,
    });
    // NOTE: not important if nothing is found; will overwrite params.drawDefinition, params.event, and params.tournamentId
    if (drawDefinition) params.drawDefinition = drawDefinition;
    if (tournamentId) params.tournamentId = tournamentId;
    if (event) params.event = event;
  }

  if (params.eventId && !params.event) {
    const { event, tournamentId } = findEvent({
      eventId: params.eventId,
      tournamentRecords,
    });
    if (!event) return { error: EVENT_NOT_FOUND };
    // NOTE:  will overwrite params.event, and params.tournamentId
    params.tournamentId = tournamentId;
    params.event = event;
  }

  const tournamentId = params.tournamentId ?? getTournamentId();
  if (!tournamentId && params) return params;

  const tournamentRecord = tournamentRecords[tournamentId];
  if (tournamentId && !tournamentRecord) {
    return { error: MISSING_TOURNAMENT_RECORD };
  }

  if (!tournamentRecord) return params;
  params.tournamentRecord = tournamentRecord;

  return params;
}
