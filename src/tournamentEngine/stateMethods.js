import { makeDeepCopy } from '../utilities';
import {
  setTournamentRecord,
  getTournamentRecord,
} from '../global/globalState';

import {
  INVALID_OBJECT,
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

export function factoryVersion() {
  return '@VERSION@';
}

export function getState({ convertExtensions, tournamentId } = {}) {
  if (typeof tournamentId !== 'string') return {};
  const tournamentRecord = getTournamentRecord(tournamentId);
  return {
    tournamentRecord: makeDeepCopy(tournamentRecord, convertExtensions),
  };
}
