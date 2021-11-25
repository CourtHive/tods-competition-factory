import { jinnScheduler } from '../jinnScheduler/jinnScheduler';

// abstraction layer to allow other schedulers to be defined at a later time
export function scheduleProfileRounds({
  checkPotentialRequestConflicts = true,
  scheduleCompletedMatchUps,
  clearScheduleDates,
  scheduleDates = [],
  tournamentRecords,
  periodLength,
  dryRun,
}) {
  return jinnScheduler({
    checkPotentialRequestConflicts,
    scheduleCompletedMatchUps,
    clearScheduleDates,
    tournamentRecords,
    scheduleDates,
    periodLength,
    dryRun,
  });
}
