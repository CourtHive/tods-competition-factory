import { getContainedStructures } from '@Query/drawDefinition/getContainedStructures';
import { allCompetitionMatchUps } from '@Query/matchUps/getAllCompetitionMatchUps';
import { getMatchUpDependencies } from '@Query/matchUps/getMatchUpDependencies';
import { getMatchUpDailyLimits } from '@Query/extensions/getMatchUpDailyLimits';
import { checkRequiredParameters } from '../../../helpers/parameters/checkRequiredParameters';
import { getVenuesAndCourts } from '@Query/venues/venuesAndCourtsGetter';
import { extractDate, isValidDateString } from '@Tools/dateTime';
import { getSchedulingProfile } from '../../tournaments/schedulingProfile';
import { jinnScheduler } from './schedulers/jinnScheduler/jinnScheduler';
import { getPersonRequests } from '@Query/matchUps/scheduling/getPersonRequests';
import { v2Scheduler } from './schedulers/v2Scheduler/v2Scheduler';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';

import { NO_VALID_DATES } from '../../../constants/errorConditionConstants';
import { DO_NOT_SCHEDULE } from '../../../constants/requestConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';
import { TournamentRecords } from '@Types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import { ARRAY, OF_TYPE, SCHEDULE_DATES, TOURNAMENT_RECORDS, VALIDATE } from '../../../constants/attributeConstants';

type ScheduleProfileRoundsArgs = {
  checkPotentialRequestConflicts?: boolean;
  tournamentRecords: TournamentRecords;
  scheduleCompletedMatchUps?: boolean;
  clearScheduleDates?: boolean;
  scheduleDates?: string[];
  periodLength?: number;
  useGarman?: boolean;
  dryRun?: boolean;
  pro?: boolean;
};
// abstraction layer to allow other schedulers to be defined at a later time
export function scheduleProfileRounds(params: ScheduleProfileRoundsArgs) {
  const {
    checkPotentialRequestConflicts = true,
    scheduleCompletedMatchUps,
    clearScheduleDates,
    scheduleDates = [],
    tournamentRecords,
    periodLength,
    useGarman,
    dryRun,
    pro,
  } = params;

  const paramsCheck = checkRequiredParameters(params, [
    { [TOURNAMENT_RECORDS]: true },
    {
      [VALIDATE]: (value) => !value || (Array.isArray(value) && value.every(isValidDateString)),
      [SCHEDULE_DATES]: false,
      [OF_TYPE]: ARRAY,
    },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const result = getSchedulingProfile({ tournamentRecords });
  if (result.error) return result;

  if (!result.schedulingProfile.length) return { ...SUCCESS };

  const {
    modifications: schedulingProfileModifications,
    issues: schedulingProfileIssues = [],
    schedulingProfile = [],
  } = result;

  // round robin structures contain other structures and the scheduler
  // needs to reference the containing structure by contained structureIds
  const containedStructureIds = Object.assign(
    {},
    ...Object.values(tournamentRecords).map(
      (tournamentRecord) => getContainedStructures({ tournamentRecord }).containedStructures,
    ),
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
    .map((scheduleDate) => isValidDateString(scheduleDate) && extractDate(scheduleDate))
    .filter((scheduleDate) => scheduleDate && (!scheduleDates.length || validScheduleDates.includes(scheduleDate)));

  // if no valid profileDates remain throw an error
  if (!profileDates.length) {
    return { error: NO_VALID_DATES };
  }

  // if array of clearScheduleDates, clear all matchUps on scheduledDates
  if (clearScheduleDates && !dryRun) {
    const scheduledDates = Array.isArray(clearScheduleDates) ? clearScheduleDates : [];
    clearScheduledMatchUps({ tournamentRecords, scheduledDates });
  }

  const courts = getVenuesAndCourts({
    ignoreDisabled: false,
    tournamentRecords,
  }).courts as any[];

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
      return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
    });

  const schedulingParams = {
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
    useGarman,
    matchUps,
    dryRun,
    courts,
  };

  if (pro) {
    return v2Scheduler(schedulingParams);
  } else {
    return jinnScheduler(schedulingParams);
  }
}
