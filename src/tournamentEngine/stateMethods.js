import { notifySubscribers } from '../global/notifySubscribers';
import { findEvent } from './getters/eventGetter';
import { makeDeepCopy } from '../utilities';
import {
  setTournamentRecord,
  getTournamentRecord,
  deleteNotices,
} from '../global/globalState';

import {
  INVALID_OBJECT,
  INVALID_VALUES,
  METHOD_NOT_FOUND,
  MISSING_TOURNAMENT_ID,
} from '../constants/errorConditionConstants';

export function setState(tournament, deepCopyOption) {
  if (typeof tournament !== 'object') return { error: INVALID_OBJECT };
  const tournamentId =
    tournament.unifiedTournamentId?.tournamentId || tournament.tournamentId;
  if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
  const tournamentRecord =
    deepCopyOption !== false ? makeDeepCopy(tournament) : tournament;
  setTournamentRecord(tournamentRecord);

  return tournamentRecord;
}

export function getState({ convertExtensions, tournamentId } = {}) {
  if (typeof tournamentId !== 'string') return {};
  const tournamentRecord = getTournamentRecord(tournamentId);
  return {
    tournamentRecord: makeDeepCopy(tournamentRecord, convertExtensions),
  };
}

export function executeFunction(tournamentRecord, fx, params) {
  if (params) {
    const { drawId } = params || (params.matchUp && params.matchUp.drawId);

    if (drawId) {
      const { event, drawDefinition } = findEvent({
        tournamentRecord,
        drawId,
      });
      params = Object.assign({}, params, { event, drawDefinition });
    }

    if (params.eventId && !params.event) {
      const { event } = findEvent({
        tournamentRecord,
        eventId: params.eventId,
      });
      if (event) {
        params = Object.assign({}, params, { event });
      }
    }
  }

  const result = fx({
    ...params,
    tournamentRecord,
  });

  return result;
}

export function executionQueue(fx, tournamentId, directives, rollBackOnError) {
  if (!Array.isArray(directives)) return { error: INVALID_VALUES };
  const tournamentRecord = getTournamentRecord(tournamentId);

  const snapshot =
    rollBackOnError && makeDeepCopy(tournamentRecord, false, true);

  const results = [];
  for (const directive of directives) {
    if (typeof directive !== 'object') return { error: INVALID_VALUES };

    const { method, params } = directive;
    if (!fx[method]) return { error: METHOD_NOT_FOUND };

    const result = executeFunction(tournamentRecord, fx[method], params);

    if (result?.error && snapshot) {
      setState(snapshot);
      return result;
    }
    results.push(result);
  }

  notifySubscribers();
  deleteNotices();

  return results;
}
