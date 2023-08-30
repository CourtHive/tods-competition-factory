import { getScheduledRoundsDetails } from '../../schedulingProfile/getScheduledRoundsDetails';
import { processAlreadyScheduledMatchUps } from './processAlreadyScheduledMatchUps';
import { getGroupedRounds } from '../../schedulingProfile/getGroupedRounds';
import { getMatchUpsToSchedule } from './getMatchUpsToSchedule';
import { generateScheduleTimes } from './generateScheduleTimes';
import { extractDate } from '../../../../../utilities/dateTime';

import { Tournament } from '../../../../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../../../../types/hydrated';

type GetVenueSchedulingDetailsArgs = {
  matchUpPotentialParticipantIds: { [key: string]: string[] };
  individualParticipantProfiles: { [key: string]: any };
  tournamentRecords: { [key: string]: Tournament };
  matchUpScheduleTimes: { [key: string]: string };
  matchUpNotBeforeTimes: { [key: string]: any };
  matchUpDependencies: { [key: string]: any };
  scheduleCompletedMatchUps?: boolean;
  containedStructureIds: string[];
  clearScheduleDates?: boolean;
  matchUps: HydratedMatchUp[];
  periodLength?: number;
  scheduleDate: string;
  useGarman?: boolean;
  courts: any[]; // scheduling information; not an actualy court
  venues: any[]; // scheduling information; not an actualy venue
};

export function getVenueSchedulingDetails({
  matchUpPotentialParticipantIds,
  individualParticipantProfiles,
  scheduleCompletedMatchUps,
  containedStructureIds,
  matchUpNotBeforeTimes,
  matchUpScheduleTimes,
  matchUpDependencies,
  clearScheduleDates,
  tournamentRecords,
  periodLength,
  scheduleDate,
  useGarman,
  matchUps,
  courts,
  venues,
}: GetVenueSchedulingDetailsArgs): {
  venueScheduledRoundDetails: { [key: string]: any };
  allDateScheduledMatchUpIds: string[];
  allDateMatchUpIds: string[];
} {
  const venueScheduledRoundDetails = {};

  // checking that matchUpDependencies is scoped to only those matchUps that are already or are to be scheduled on the same date
  const allDateScheduledMatchUpIds: string[] = [];
  const allDateMatchUpIds: string[] = [];

  // first pass through all venues is to build up an array of all matchUpIds in the schedulingProfile for current scheduleDate
  for (const venue of venues) {
    const { rounds = [], venueId } = venue; // rounds derives from dateSchedulingProfile
    const {
      scheduledRoundsDetails,
      greatestAverageMinutes,
      orderedMatchUpIds,
      minutesMap,
    } = getScheduledRoundsDetails({
      scheduleCompletedMatchUps,
      containedStructureIds,
      tournamentRecords,
      periodLength,
      matchUps,
      rounds,
    });

    allDateMatchUpIds.push(...(orderedMatchUpIds || []));

    const { groupedRounds } = getGroupedRounds({
      scheduledRoundsDetails,
      greatestAverageMinutes,
      garmanSinglePass: true,
    });

    let dateScheduledMatchUpIds;
    let dateScheduledMatchUps;
    let scheduleTimes: any = [];

    if (useGarman) {
      // determines court availability taking into account already scheduled matchUps on the scheduleDate
      // optimization to pass already retrieved competitionMatchUps to avoid refetch (requires refactor)
      // on first call pass in the averageMatchUpMiutes of first round to be scheduled
      ({ scheduleTimes, dateScheduledMatchUpIds, dateScheduledMatchUps } =
        generateScheduleTimes({
          averageMatchUpMinutes: groupedRounds[0]?.averageMinutes,
          scheduleDate: extractDate(scheduleDate),
          venueIds: [venue.venueId],
          clearScheduleDates,
          tournamentRecords,
          periodLength,
          matchUps,
        }));
    }

    const processResult = processAlreadyScheduledMatchUps({
      matchUpPotentialParticipantIds,
      individualParticipantProfiles,
      dateScheduledMatchUpIds,
      greatestAverageMinutes,
      matchUpNotBeforeTimes,
      matchUpScheduleTimes,
      matchUpDependencies,
      clearScheduleDates,
      scheduleDate,
      minutesMap,
      matchUps,
    });
    const clearDate = processResult.clearDate;
    ({ dateScheduledMatchUpIds, dateScheduledMatchUps } = processResult);

    const { matchUpsToSchedule, matchUpMap } = getMatchUpsToSchedule({
      matchUpPotentialParticipantIds,
      scheduleCompletedMatchUps,
      dateScheduledMatchUpIds,
      matchUpNotBeforeTimes,
      orderedMatchUpIds,
      clearDate,
      matchUps,
    });

    const venueCourts = courts.filter((court) => court.venueId === venueId);
    venueScheduledRoundDetails[venueId] = {
      previousRemainingScheduleTimes: [], // keep track of sheduleTimes not used on previous iteration
      courtsCount: venueCourts.length,
      greatestAverageMinutes,
      scheduledRoundsDetails,
      dateScheduledMatchUps,
      matchUpsToSchedule,
      scheduleTimes,
      groupedRounds,
      venueCourts,
      minutesMap,
      matchUpMap,
    };

    if (!clearScheduleDates) {
      allDateScheduledMatchUpIds.push(...dateScheduledMatchUpIds);
    }
  }

  return {
    allDateScheduledMatchUpIds,
    venueScheduledRoundDetails,
    allDateMatchUpIds,
  };
}
