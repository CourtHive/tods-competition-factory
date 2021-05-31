import { getMatchUpFormatTiming } from '../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { competitionScheduleMatchUps } from '../../getters/matchUpsGetter';
import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';
import { getScheduleTimes } from './garman/getScheduleTimes';
import {
  addMinutesToTimeString,
  extractTime,
  sameDay,
  timeToDate,
} from '../../../utilities/dateTime';

/**
 *
 * @param {object[]} tournamentRecords - passed in by competitionEngine
 * @param {string} startTime - military time string, time only, e.g. '08:00'
 * @param {string} endTime - military time string, time only, e.g. '18:00'
 * @param {string} date - e.g. '2100-01-01'
 * @param {string[]} venueIds - optional - look for availaiblity only courts at specified venues
 *
 * NOTE: not using matchUpFormat here because time per format is defined by policy
 * @param {number} averageMatchUpMinutes - number of minutes per match
 * @param {number} periodLengh - number of minutes in a scheduling period
 * @returns
 */
export function calculateScheduleTimes({
  tournamentRecords,
  startTime,
  endTime,
  date,

  defaultRecoveryMinutes = 60,
  averageMatchUpMinutes = 90,
  periodLength = 30,

  venueIds,
}) {
  const { courts: allCourts, venues } = getVenuesAndCourts({
    tournamentRecords,
  });

  const courts = allCourts.filter(
    (court) => !venueIds || venueIds.includes(court.venueId)
  );

  if (!startTime) {
    startTime = courts.reduce((minStartTime, court) => {
      const dateAvailability = court.dateAvailability?.find((availability) =>
        sameDay(date, availability.date)
      );
      const comparisonStartTime =
        dateAvailability?.startTime || court.startTime;

      return comparisonStartTime &&
        (!minStartTime ||
          timeToDate(comparisonStartTime) < timeToDate(minStartTime))
        ? comparisonStartTime
        : minStartTime;
    }, undefined);
  }

  if (!endTime) {
    endTime = courts.reduce((maxEndTime, court) => {
      const dateAvailability = court.dateAvailability?.find((availability) =>
        sameDay(date, availability.date)
      );
      const comparisonEndTime = dateAvailability?.endTime || court.endTime;

      return comparisonEndTime &&
        (!maxEndTime || timeToDate(comparisonEndTime) > timeToDate(maxEndTime))
        ? comparisonEndTime
        : maxEndTime;
    }, undefined);
  }

  // get a mapping of eventIds to category details
  const eventDetails = Object.assign(
    {},
    ...Object.keys(tournamentRecords)
      .map((tournamentId) =>
        (tournamentRecords[tournamentId].events || []).map((event) => ({
          [event.eventId]: { tournamentId, event },
        }))
      )
      .flat()
  );

  // Get an array of all matchUps scheduled for the date
  // some of them may have courts assigned and some may only have venueIds
  // need to reduce courts available for a given time period by the number of matchUps scheduled at a given venue
  const matchUpFilters = { scheduledDate: date };
  const dateMatchUps =
    competitionScheduleMatchUps({
      tournamentRecords,
      sortDateMatchUps: false, // unnecessary for extracting bookings; reduce processing overhead;
      matchUpFilters,
    })?.dateMatchUps || [];

  const bookings = dateMatchUps?.map(({ eventId, schedule, matchUpFormat }) => {
    const { event, tournamentId } = eventDetails[eventId];
    const tournamentRecord = tournamentRecords[tournamentId];
    const { averageMinutes } = getMatchUpFormatTiming({
      defaultAverageMinutes: averageMatchUpMinutes,
      defaultRecoveryMinutes,
      matchUpFormat,
      tournamentRecord,
      event,
    });
    const { courtId, venueId } = schedule;
    const startTime = extractTime(schedule.scheduledTime);
    const endTime = addMinutesToTimeString(startTime, averageMinutes);
    const booking = {
      averageMinutes,
      startTime,
      endTime,
      courtId,
      venueId,
    };
    return booking;
  });

  const timingParameters = {
    date,
    courts,
    startTime,
    endTime,
    bookings,
    periodLength,
    averageMatchUpMinutes,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);

  // if a single venue specified, or only one venue available, return venueId
  const venueId =
    venueIds?.length === 1
      ? venueIds[0]
      : venues?.length === 1
      ? venues[0].venueId
      : undefined;

  const dateScheduledMatchUpIds = dateMatchUps.map(
    ({ matchUpId }) => matchUpId
  );

  return { venueId, scheduleTimes, dateScheduledMatchUpIds };
}
