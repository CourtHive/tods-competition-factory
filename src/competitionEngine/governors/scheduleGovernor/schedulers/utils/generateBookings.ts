import { matchUpFormatTimes } from '../../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { getScheduleTiming } from '../../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { validMatchUps } from '../../../../../matchUpEngine/governors/queryGovernor/validMatchUp';
import { calculatePeriodLength } from './calculatePeriodLength';
import { hasSchedule } from '../../scheduleMatchUps/hasSchedule';
import {
  addMinutesToTimeString,
  extractTime,
} from '../../../../../utilities/dateTime';

import { Tournament } from '../../../../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../../../../types/hydrated';
import {
  MISSING_MATCHUPS,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../../constants/errorConditionConstants';

type GenerateBookingsArgs = {
  tournamentRecords: { [key: string]: Tournament };
  dateScheduledMatchUps?: HydratedMatchUp[];
  defaultRecoveryMinutes?: number;
  averageMatchUpMinutes?: number;
  matchUps?: HydratedMatchUp[];
  periodLength?: number;
  scheduleDate?: string;
  venueIds?: string[];
};
export function generateBookings({
  defaultRecoveryMinutes = 0,
  averageMatchUpMinutes = 90,
  dateScheduledMatchUps,
  tournamentRecords,
  venueIds = [],
  periodLength,
  scheduleDate,
  matchUps,
}: GenerateBookingsArgs) {
  if (typeof tournamentRecords !== 'object')
    return { error: MISSING_TOURNAMENT_RECORDS };

  if (!validMatchUps(matchUps) && !Array.isArray(dateScheduledMatchUps))
    return { error: MISSING_MATCHUPS };

  periodLength =
    periodLength ||
    calculatePeriodLength({
      recoveryMinutes: defaultRecoveryMinutes,
      averageMatchUpMinutes,
    });

  // get a mapping of eventIds to category details
  const eventDetails = Object.assign(
    {},
    ...Object.values(tournamentRecords)
      .map((tournamentRecord) =>
        (tournamentRecord.events || []).map((event) => {
          const { scheduleTiming } = getScheduleTiming({
            tournamentRecord,
            event,
          });

          return {
            [event.eventId]: { event, scheduleTiming },
          };
        })
      )
      .flat()
  );

  const defaultTiming = {
    averageTimes: [{ minutes: { default: averageMatchUpMinutes } }],
    recoveryTimes: [{ minutes: { default: defaultRecoveryMinutes } }],
  };

  if (!dateScheduledMatchUps) {
    dateScheduledMatchUps = matchUps?.filter((matchUp) => {
      const schedule = matchUp.schedule;
      return (
        hasSchedule({ schedule }) &&
        (!scheduleDate || matchUp.schedule.scheduledDate === scheduleDate)
      );
    });
  }

  const relevantMatchUps = dateScheduledMatchUps?.filter(
    (matchUp) => !venueIds.length || venueIds.includes(matchUp.schedule.venueId)
  );

  const bookings = relevantMatchUps
    ?.map(({ eventId, schedule, matchUpFormat }) => {
      const { event, scheduleTiming } = eventDetails[eventId];
      const eventType = event?.eventType;
      const timingDetails = {
        ...scheduleTiming,
        defaultTiming,
        matchUpFormat,
      };
      const { averageMinutes, recoveryMinutes } = matchUpFormatTimes({
        timingDetails,
        eventType,
      });
      const { courtId, venueId } = schedule;
      const startTime = extractTime(schedule.scheduledTime);
      const endTime = addMinutesToTimeString(startTime, averageMinutes);
      return {
        recoveryMinutes,
        averageMinutes,
        periodLength,
        startTime,
        courtId,
        endTime,
        venueId,
      };
    })
    .filter(Boolean);

  return { bookings, relevantMatchUps, dateScheduledMatchUps };
}
