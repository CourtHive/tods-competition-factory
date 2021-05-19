import { MISSING_TOURNAMENT_RECORDS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function bulkRemoveMatchUpScheduleItems({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  // re-running the auto-scheduler should remove all scheduling information from matchUps which have not been completed
  // removing scheduling information would mean either removing the scheduling timeItems completely or adding an undefined value

  return SUCCESS;
}
