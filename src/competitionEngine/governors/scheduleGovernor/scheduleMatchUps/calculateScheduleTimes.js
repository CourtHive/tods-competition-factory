import { matchUpFormatTimes } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { getScheduleTiming } from '../../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getScheduleTiming';
import { competitionScheduleMatchUps } from '../../../getters/matchUpsGetter';
import { getVenuesAndCourts } from '../../../getters/venuesAndCourtsGetter';
import { getScheduleTimes } from '../garman/getScheduleTimes';
import {
  addMinutesToTimeString,
  extractTime,
  sameDay,
  timeStringMinutes,
} from '../../../../utilities/dateTime';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';

/**
 *
 * @param {object[]} tournamentRecords - passed in by competitionEngine
 * @param {string[]} venueIds - optional - look for availaiblity only courts at specified venues
 * @param {boolean} calculateStartTimeFromCourts - defaults to true - will override supplied startTime
 * @param {string} startTime - military time string, time only, e.g. '08:00'
 * @param {string} endTime - military time string, time only, e.g. '18:00'
 * @param {string} scheduleDate - date string 'YYYY-MM-DD'
 *
 * NOTE: not using matchUpFormat here because time per format is defined by policy
 * @param {number} averageMatchUpMinutes - number of minutes per match
 * @param {number} periodLengh - number of minutes in a scheduling period
 * @returns
 */
export function calculateScheduleTimes({
  tournamentRecords,
  remainingScheduleTimes,

  calculateStartTimeFromCourts = true,
  defaultRecoveryMinutes = 60,
  averageMatchUpMinutes = 90,
  periodLength = 30,
  scheduleDate,
  startTime,
  endTime,

  venueIds,
}) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { courts: allCourts, venues } = getVenuesAndCourts({
    tournamentRecords,
  });

  const courts = allCourts.filter(
    (court) => !venueIds || venueIds.includes(court.venueId)
  );

  if (!startTime) {
    startTime = courts.reduce((minStartTime, court) => {
      const dateAvailability = court.dateAvailability?.find(
        // if no date is specified consider it to be default for all tournament dates
        (availability) =>
          !availability.date || sameDay(scheduleDate, availability.date)
      );
      const comparisonStartTime =
        dateAvailability?.startTime || court.startTime;

      return comparisonStartTime &&
        (!minStartTime ||
          timeStringMinutes(comparisonStartTime) <
            timeStringMinutes(minStartTime))
        ? comparisonStartTime
        : minStartTime;
    }, undefined);
  }

  if (!endTime) {
    endTime = courts.reduce((maxEndTime, court) => {
      const dateAvailability = court.dateAvailability?.find(
        // if no date is specified consider it to be default for all tournament dates
        (availability) =>
          !availability.date || sameDay(scheduleDate, availability.date)
      );
      const comparisonEndTime = dateAvailability?.endTime || court.endTime;

      return comparisonEndTime &&
        (!maxEndTime ||
          timeStringMinutes(comparisonEndTime) > timeStringMinutes(maxEndTime))
        ? comparisonEndTime
        : maxEndTime;
    }, undefined);
  }

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

  // Get an array of all matchUps scheduled for the date
  // some of them may have courts assigned and some may only have venueIds
  // need to reduce courts available for a given time period by the number of matchUps scheduled at a given venue
  const matchUpFilters = { scheduledDate: scheduleDate, venueIds };
  const matchUpsWithSchedule = competitionScheduleMatchUps({
    tournamentRecords,
    sortDateMatchUps: false, // unnecessary for extracting bookings; reduce processing overhead;
    matchUpFilters,
  });

  const relevantMatchUps = [].concat(
    ...(matchUpsWithSchedule.dateMatchUps || []),
    ...(matchUpsWithSchedule.completedMatchUps || [])
  );

  const defaultTiming = {
    averageTimes: [{ minutes: { default: averageMatchUpMinutes } }],
    recoveryTimes: [{ minutes: { default: defaultRecoveryMinutes } }],
  };

  const bookings = relevantMatchUps?.map(
    ({ eventId, schedule, matchUpFormat }) => {
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
        averageMinutes,
        recoveryMinutes,
        periodLength,
        startTime,
        endTime,
        courtId,
        venueId,
      };
      return booking;
    }
  );

  const timingParameters = {
    calculateStartTimeFromCourts,
    remainingScheduleTimes,
    averageMatchUpMinutes,
    periodLength,
    startTime,
    endTime,
    bookings,
    courts,
    date: scheduleDate,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);

  // if a single venue specified, or only one venue available, return venueId
  const venueId =
    venueIds?.length === 1
      ? venueIds[0]
      : venues?.length === 1
      ? venues[0].venueId
      : undefined;

  const dateScheduledMatchUpIds = relevantMatchUps.map(
    ({ matchUpId }) => matchUpId
  );

  return { venueId, scheduleTimes, dateScheduledMatchUpIds };
}
