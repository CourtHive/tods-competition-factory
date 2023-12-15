import { findEvent } from '../../../acquire/findEvent';
import { getTournamentId } from '../../../global/state/globalState';

import { TournamentRecords } from '../../../types/factoryTypes';

export function paramsMiddleware(
  tournamentRecords: TournamentRecords,
  params: { [key: string]: any }
) {
  const tournamentId = getTournamentId();
  if (!tournamentId && params) return params;

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return params;
  params.tournamentRecord = tournamentRecord;

  const drawId = params.drawId || params.matchUp?.drawId;

  if (drawId) {
    const { event, drawDefinition } = findEvent({
      tournamentRecord,
      drawId,
    });
    params.drawDefinition = drawDefinition;
    params.event = event;
  }

  if (params.eventId && !params.event) {
    const { event } = findEvent({
      eventId: params.eventId,
      tournamentRecord,
    });
    if (event) {
      params.event = event;
    }
  }

  return params;
}
