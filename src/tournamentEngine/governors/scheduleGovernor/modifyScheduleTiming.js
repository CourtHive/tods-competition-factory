import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyScheduleTiming({
  tournamentRecord,
  event,
  matchUpAverageTimes,
  matchUpRecoveryTimes,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return SUCCESS;
}
