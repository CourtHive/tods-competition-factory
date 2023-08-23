import { getAllDrawMatchUps } from '../drawEngine/getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../drawEngine/getters/getMatchUps/getMatchUpsMap';
import { findEvent } from './getters/eventGetter';
import { makeDeepCopy } from '../utilities';
import {
  getTournamentRecord,
  setTournamentId,
  setTournamentRecords,
} from '../global/state/globalState';

import {
  INVALID_OBJECT,
  MISSING_TOURNAMENT_ID,
} from '../constants/errorConditionConstants';

export function setState(tournament, deepCopyOption?) {
  if (typeof tournament !== 'object') return { error: INVALID_OBJECT };
  const tournamentId =
    tournament.unifiedTournamentId?.tournamentId || tournament.tournamentId;
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord =
    deepCopyOption !== false ? makeDeepCopy(tournament) : tournament;

  setTournamentRecords({ [tournamentId]: tournamentRecord });
  setTournamentId(tournamentId); // must be set AFTER tournamentRecord

  return tournamentRecord;
}

type GetStateArgs = {
  convertExtensions?: boolean;
  removeExtensions?: boolean;
  tournamentId: string | undefined;
};

export function getState({
  convertExtensions = false,
  removeExtensions = false,
  tournamentId,
}: GetStateArgs) {
  if (typeof tournamentId !== 'string') return {};
  const tournamentRecord = getTournamentRecord(tournamentId);
  return {
    tournamentRecord: makeDeepCopy(
      tournamentRecord,
      convertExtensions,
      false,
      removeExtensions
    ),
  };
}

// prefetch can be triggered based on method governor, e.g. not necessary for query
export function paramsMiddleware(tournamentRecord, params, prefetch?) {
  if (params) {
    const drawId = params.drawId || params.matchUp?.drawId;

    if (drawId) {
      const { event, drawDefinition } = findEvent({
        tournamentRecord,
        drawId,
      });

      params = {
        ...params,
        event,
        drawDefinition,
      };

      if (prefetch) {
        const matchUpsMap = getMatchUpsMap({ drawDefinition });

        const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
          inContext: true,
          drawDefinition,
          matchUpsMap,
        });

        params.matchUpsMap = matchUpsMap;
        params.inContextDrawMatchUps = inContextDrawMatchUps;
      }
    }

    if (params.eventId && !params.event) {
      const { event } = findEvent({
        eventId: params.eventId,
        tournamentRecord,
      });
      if (event) {
        params = { ...params, event };
      }
    }
  }

  return params;
}
