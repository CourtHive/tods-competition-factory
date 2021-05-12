import { findTournamentExtension } from '../../../tournamentEngine/governors/queryGovernor/extensionQueries';
import {
  addTournamentExtension,
  removeTournamentExtension,
} from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
  NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addExtension({ tournamentRecords, extension }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!extension) return { error: MISSING_VALUE };
  if (typeof extension !== 'object' || !extension.name)
    return { error: INVALID_VALUES };

  let error;
  const success = Object.keys(tournamentRecords).every((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const result = addTournamentExtension({ tournamentRecord, extension });
    if (!result.error) {
      return true;
    } else {
      error = result.error;
    }
  });

  return success ? SUCCESS : { error };
}

export function findExtension({ tournamentRecords, name }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!name) return { error: MISSING_VALUE, message: 'Missing name' };

  let foundExtension;
  const tournamentId = Object.keys(tournamentRecords).find((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { extension } = findTournamentExtension({
      tournamentRecord,
      name,
    });
    foundExtension = extension;
    return !!extension;
  });

  return tournamentId ? { extension: foundExtension } : { error: NOT_FOUND };
}

export function removeExtension({ tournamentRecords, name }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!name) return { error: MISSING_VALUE, message: 'Missing name' };

  let error,
    removed = 0;
  const success = Object.keys(tournamentRecords).every((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    const result = removeTournamentExtension({ tournamentRecord, name });
    if (!result.error) {
      removed++;
      return true;
    } else {
      error = result.error;
    }
  });

  return success ? Object.assign({}, SUCCESS, { removed }) : { error };
}
