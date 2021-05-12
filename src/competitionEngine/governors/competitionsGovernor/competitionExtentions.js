import { addTournamentExtension } from '../../../tournamentEngine/governors/tournamentGovernor/addRemoveExtensions';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
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
