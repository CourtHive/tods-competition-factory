import { matchUpFormatTimes } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { getScheduleTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { calculatePeriodLength } from './calculatePeriodLength';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import {
  addMinutesToTimeString,
  extractTime,
} from '../../../../utilities/dateTime';
import {
  MISSING_MATCHUPS,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

/**
 * generates bookings objects which may be used for generating "virtual" views of court availability
 * @param {object} tournamentRecords - provided automatically by competitionEngine
 * @param {integer} defaultRecoveryMinutes - recoveryMinutes to use if not found in scheduling policy
 * @param {integer} averageMatchUpMinutes - averageMinutes to use if not found in scheduling policy
 * @param {integer} periodLength - scheduling period in minutes
 * @param {object[]} matchUps - matchUps with schedules from which to derive bookings
 * @returns {object} bookings - [{ averageMinutes, recoveryMinutes, periodLength, startTime, endTime, courtId, venueId }]
 * @returns {object[]} relevantMatchUps - [{ ...matchUp }]
 */
export function generateBookings({
  defaultRecoveryMinutes,
  averageMatchUpMinutes,
  tournamentRecords,
  venueIds = [],
  periodLength,
  scheduleDate,
  matchUps,
}) {
  if (typeof tournamentRecords !== 'object')
    return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(matchUps)) return { error: MISSING_MATCHUPS };

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

  const dateScheduledMatchUps = matchUps?.filter(
    (matchUp) =>
      hasSchedule(matchUp) &&
      (!scheduleDate || matchUp.schedule.scheduledDate === scheduleDate)
  );

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
        eventType,
        timingDetails,
      });
      const { courtId, venueId } = schedule;
      const startTime = extractTime(schedule.scheduledTime);
      const endTime = addMinutesToTimeString(startTime, averageMinutes);
      const booking = {
        recoveryMinutes,
        averageMinutes,
        periodLength,
        startTime,
        courtId,
        endTime,
        venueId,
      };
      return booking;
    })
    .filter(Boolean);

  return { bookings, relevantMatchUps, dateScheduledMatchUps };
}
