import { tournamentConstants } from '../../../constants/tournamentConstants';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function setTournamentStatus({ tournamentRecord, status }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  if (status && !Object.keys(tournamentConstants).includes(status))
    return { error: INVALID_VALUES, info: 'Unknown status' };

  tournamentRecord.tournamentStatus = status;

  return { ...SUCCESS };
}
