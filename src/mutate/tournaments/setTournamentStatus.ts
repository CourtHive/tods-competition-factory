import { tournamentConstants } from '@Constants/tournamentConstants';

import { SUCCESS } from '@Constants/resultConstants';
import { INVALID_VALUES, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';

export function setTournamentStatus({ tournamentRecord, status }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (status && !Object.keys(tournamentConstants).includes(status))
    return { error: INVALID_VALUES, info: 'Unknown status' };

  tournamentRecord.tournamentStatus = status;

  return { ...SUCCESS };
}
