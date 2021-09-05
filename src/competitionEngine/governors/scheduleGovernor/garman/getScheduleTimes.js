import { getCourtsAvailableAtPeriodStart } from './getCourtsAvailableAtPeriodStart';
import { getVirtualCourtBookings } from './getVirtualCourtBookings';
import { generateRange } from '../../../../utilities/arrays';
import { courtGenerator } from './courtGenerator';
import {
  currentUTCDate,
  extractTime,
  extractDate,
  timeStringMinutes,
  dayMinutesToTimeString,
} from '../../../../utilities/dateTime';

/**
 *
 * @param {integer} averageMatchUpMinutes - average length of matchUps to be considered
 * @param {string} date - optional - YYYY-MM-DD date string - defaults to current UTC date
 * @param {integer} periodLength - number of minutes in a scheduling period
 * @param {boolean} calculateStartTimeFromCourts - defaults to true - use court startTimes, endTimes, and availabillity to derive startTime
 * @param {string} startTime - HH:MM time string
 * @param {string} endTime - HH:MM time string
 *
 * @param {object[]} bookings - optional - array of bookings objects [{ startTime, endTime, bookingType }]
 * @param {object[]} courts - array of court objects [{ courtId, dateAvailability: [{ date, startTime, endTime }]]
 * @param {integer} courtsCount - optional - useful for generating mock courts objects using { date, startTime, endTime }
 *
 *  @returns {string[]} scheduleTimes - array of time strings: ['HH:MM', 'HH:MM']
 *  @returns {object[]} timingProfile - array of periods [{ periodStart, add, availableToScheduleCount, newCourts, totalMatchUps}]
 *  @returns {integer} totalMatchUps - total number of matchUps of averageMatchUpMinutes that can be scheduled
 */
export function getScheduleTimes({
  calculateStartTimeFromCourts = true,
  averageMatchUpMinutes = 90,
  date = currentUTCDate(),
  periodLength = 30,
  startTime = '08:00',
  endTime = '19:00',
  courtsCount,
  bookings,
  courts,
} = {}) {
  // standardize date as YYYY-MM-DD
  date = extractDate(date);
  // standardize time as 00:00
  startTime = extractTime(startTime);
  endTime = extractTime(endTime);

  // keeps track of value of calculation after previous iteration
  let previousCalculation = 0;

  // keeps track of # of courts available during previous iteration
  let previousAvailableCourts = 0;

  // cumulativeMatches (float) number of matchUps possible for averageCourts
  // over # of periods of length periodLength
  let cumulativeMatches = 0;

  // accumulated matchUps which have been scheduled
  let totalMatchUps = 0;

  // accumulated time periods when a court was available for scheduling
  let cumulativePeriods = 0;

  if (!courts && courtsCount) {
    courts = courtGenerator({ startTime, endTime, count: courtsCount, date });
  }

  const { virtualCourts, firstTimeSlotStartTime } = getVirtualCourtBookings({
    averageMatchUpMinutes,
    periodLength,
    startTime,
    endTime,
    bookings,
    courts,
    date,
  });

  if (calculateStartTimeFromCourts && firstTimeSlotStartTime) {
    startTime = firstTimeSlotStartTime || startTime;
  }

  // startTime, endTime and periodLength are used to calculate periodCount
  const dayStartMinutes = timeStringMinutes(startTime);
  const dayEndMinutes = timeStringMinutes(endTime);
  const dayMinutes = dayEndMinutes - dayStartMinutes;
  const periodCount = Math.floor(dayMinutes / periodLength);
  const periods = generateRange(0, periodCount + 1);

  const timingProfile = periods.map((period) => {
    const periodStartMinutes = dayStartMinutes + period * periodLength;
    const periodStart = dayMinutesToTimeString(periodStartMinutes);

    // availableToScheduleCount calculated from periodStartTime and averageMatchUpMinutes
    // a court is only available if it can accommodate matchUps of duration averageMatchUpMinutes
    const { availableToScheduleCount } = getCourtsAvailableAtPeriodStart({
      courts: virtualCourts,
      averageMatchUpMinutes,
      periodLength,
      periodStart,
      period,
      date,
    });

    // newCourts are courts which have become available for the start of current time period
    const newCourts =
      availableToScheduleCount > previousAvailableCourts
        ? availableToScheduleCount - previousAvailableCourts
        : 0;

    cumulativePeriods += period ? availableToScheduleCount : 0;
    const averageCourts = period
      ? cumulativePeriods / period
      : availableToScheduleCount;

    // calculatedTotal uses Revised Garman Formula to calculate total number of matchUps
    // which should be possible given a number of periods and an average number of courts
    // available over the accumulated time
    const accumulatedTime = periodLength * averageCourts;
    const matchesCalculation = accumulatedTime / averageMatchUpMinutes;
    const calculatedTotal = period
      ? matchesCalculation * (period - 1) + averageCourts
      : averageCourts;

    // used to increment cumulativeMatches
    // difference between current calculation and previous calculation
    // if no available courts then Zero so that cumulativeMatches does not increase
    // if available courts but no previously available courts then newCourts;
    const calculationDifference = !availableToScheduleCount
      ? 0
      : previousAvailableCourts
      ? calculatedTotal - previousCalculation
      : newCourts;

    previousCalculation = calculatedTotal;
    previousAvailableCourts = availableToScheduleCount;
    cumulativeMatches += calculationDifference;

    const addToSchedule = parseInt(cumulativeMatches) - totalMatchUps;
    totalMatchUps += addToSchedule;

    return {
      periodStart,
      add: addToSchedule,
      availableToScheduleCount,
      newCourts,
      totalMatchUps,
    };
  });

  const scheduleTimes = timingProfile
    .reduce((scheduleTimes, profile) => {
      return scheduleTimes.concat(
        ...generateRange(0, profile.add).map(() => {
          const scheduleTime = profile.periodStart;
          return { scheduleTime };
        })
      );
    }, [])
    .flat();

  return { scheduleTimes, timingProfile, totalMatchUps };
}
