import { getContainedStructures } from '../../../../tournamentEngine/governors/tournamentGovernor/getContainedStructures';
import { getMatchUpDependencies } from '../scheduleMatchUps/getMatchUpDependencies';
import { extractDate, isValidDateString } from '../../../../utilities/dateTime';
import { getSchedulingProfile } from './schedulingProfile';
import { getVenuesAndCourts } from '../../../getters/venuesAndCourtsGetter';
import { jinnScheduler } from '../schedulers/jinnScheduler/jinnScheduler';
import { allCompetitionMatchUps } from '../../../getters/matchUpsGetter';
import { proScheduler } from '../schedulers/proScheduler/proScheduler';
import { getPersonRequests } from '../scheduleMatchUps/personRequests';
import { clearScheduledMatchUps } from '../clearScheduledMatchUps';
import { getMatchUpDailyLimits } from '../getMatchUpDailyLimits';

import { DO_NOT_SCHEDULE } from '../../../../constants/requestConstants';
import { DOUBLES, SINGLES } from '../../../../constants/matchUpTypes';
import { Tournament } from '../../../../types/tournamentFromSchema';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
  NO_VALID_DATES,
} from '../../../../constants/errorConditionConstants';

type ScheduleProfileRoundsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  checkPotentialRequestConflicts?: boolean;
  scheduleCompletedMatchUps?: boolean;
  clearScheduleDates?: boolean;
  scheduleDates?: string[];
  periodLength?: number;
  dryRun?: boolean;
  pro?: boolean;
};
// abstraction layer to allow other schedulers to be defined at a later time
export function scheduleProfileRounds({
  checkPotentialRequestConflicts = true,
  scheduleCompletedMatchUps,
  clearScheduleDates,
  scheduleDates = [],
  tournamentRecords,
  periodLength,
  dryRun,
  pro,
}: ScheduleProfileRoundsArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(scheduleDates)) return { error: INVALID_VALUES };

  const result = getSchedulingProfile({ tournamentRecords });
  if (result.error) return result;

  const {
    schedulingProfile = [],
    issues: schedulingProfileIssues = [],
    modifications: schedulingProfileModifications,
  } = result;

  // round robin structures contain other structures and the scheduler
  // needs to reference the containing structure by contained structureIds
  const containedStructureIds = Object.assign(
    {},
    ...Object.values(tournamentRecords).map(
      (tournamentRecord) =>
        getContainedStructures({ tournamentRecord }).containedStructures
    )
  );

  // ensure all scheduleDates are valid date strings
  const validScheduleDates = scheduleDates
    .map((scheduleDate) => {
      if (!isValidDateString(scheduleDate)) return;
      return extractDate(scheduleDate);
    })
    .filter(Boolean);

  // filter out any invalid scheduleDates in schedulingProfile
  const profileDates = schedulingProfile
    .map((dateSchedulingProfile) => dateSchedulingProfile.scheduleDate)
    .map(
      (scheduleDate) =>
        isValidDateString(scheduleDate) && extractDate(scheduleDate)
    )
    .filter(
      (scheduleDate) =>
        scheduleDate &&
        (!scheduleDates.length || validScheduleDates.includes(scheduleDate))
    );

  // if no valid profileDates remain throw an error
  if (!profileDates.length) {
    return { error: NO_VALID_DATES };
  }

  // if array of clearScheduleDates, clear all matchUps on scheduledDates
  if (clearScheduleDates && !dryRun) {
    const scheduledDates = Array.isArray(clearScheduleDates)
      ? clearScheduleDates
      : [];
    clearScheduledMatchUps({ tournamentRecords, scheduledDates });
  }

  const { courts } = getVenuesAndCourts({
    dates: scheduleDates,
    ignoreDisabled: true,
    tournamentRecords,
  });

  const { matchUps } = allCompetitionMatchUps({
    matchUpFilters: { matchUpTypes: [SINGLES, DOUBLES] },
    afterRecoveryTimes: true,
    nextMatchUps: true,
    tournamentRecords,
  });

  // build up a map of all matchUp dependencies
  const { matchUpDependencies } = getMatchUpDependencies({
    includeParticipantDependencies: true,
    tournamentRecords,
    matchUps,
  });

  const { matchUpDailyLimits } = getMatchUpDailyLimits({ tournamentRecords });

  const { personRequests } = getPersonRequests({
    requestType: DO_NOT_SCHEDULE,
    tournamentRecords,
  });

  // filter out any dates in schedulingProfile which have been excluded and sort
  const dateSchedulingProfiles = schedulingProfile
    .filter((dateschedulingProfile) => {
      const scheduleDate = extractDate(dateschedulingProfile?.scheduleDate);
      return profileDates.includes(scheduleDate);
    })
    .sort((a, b) => {
      return (
        new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime()
      );
    });

  const params = {
    schedulingProfileModifications,
    checkPotentialRequestConflicts,
    scheduleCompletedMatchUps,
    schedulingProfileIssues,
    dateSchedulingProfiles,
    containedStructureIds,
    matchUpDependencies,
    matchUpDailyLimits,
    clearScheduleDates,
    tournamentRecords,
    schedulingProfile,
    personRequests,
    periodLength,
    matchUps,
    dryRun,
    courts,
  };

  if (!pro) {
    return jinnScheduler(params);
  } else {
    return proScheduler(params);
  }
}
