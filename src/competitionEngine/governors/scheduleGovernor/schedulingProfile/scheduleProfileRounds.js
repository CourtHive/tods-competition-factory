import { jinnScheduler } from '../jinnScheduler/jinnScheduler';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function scheduleProfileRounds({
  checkPotentialRequestConflicts = true,
  clearScheduleDates,
  scheduleDates = [],
  tournamentRecords,
  periodLength,
  dryRun,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  return jinnScheduler({
    checkPotentialRequestConflicts,
    clearScheduleDates,
    tournamentRecords,
    scheduleDates,
    periodLength,
    dryRun,
  });
}
