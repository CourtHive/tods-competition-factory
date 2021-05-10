import { generateRange } from '../../../../utilities/arrays';
import {
  DateHHMM,
  currentUTCDate,
  timeToDate,
  addMinutes,
  minutesDifference,
} from '../../../../utilities/dateTime';
import { courtsAvailableAtPeriodStart } from './courtsAvailableAtPeriodStart';

export function getScheduleTimes({
  startTime = '8:00',
  endTime = '19:00',
  date = currentUTCDate(),
  periodLength = 30,
  averageMatchUpTime = 90,
  bookings,
  courts,
} = {}) {
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

  // startTime, endTime and periodLength are used to calculate periodCount
  const dayStartTime = timeToDate(startTime);
  const dayEndTime = timeToDate(endTime);
  const dayMinutes = minutesDifference(dayEndTime, dayStartTime);
  const periodCount = Math.floor(dayMinutes / periodLength);
  const periods = generateRange(0, periodCount + 1);

  const timingProfile = periods.map((period) => {
    const periodStartTime = addMinutes(dayStartTime, period * periodLength);
    const periodStart = DateHHMM(periodStartTime, { displaySeconds: false });

    // availableCourts calculated from periodStartTime and averageMatchUpTime
    // a court is only available if it can accommodate matchUps of duration averageMatchUpTime
    const availableCourts = courtsAvailableAtPeriodStart({
      averageMatchUpTime,
      periodStart,
      bookings,
      courts,
      date,
    }).count;

    // newCourts are courts which have become available for the start of current time period
    const newCourts =
      availableCourts > previousAvailableCourts
        ? availableCourts - previousAvailableCourts
        : 0;

    cumulativePeriods += period ? availableCourts : 0;
    const averageCourts = period ? cumulativePeriods / period : availableCourts;

    // calculatedTotal uses Revised Garman Formula to calculate total number of matchUps
    // which should be possible given a number of periods and an average number of courts
    // available over the accumulated time
    const accumulatedTime = periodLength * averageCourts;
    const matchesCalculation = accumulatedTime / averageMatchUpTime;
    const calculatedTotal = period
      ? matchesCalculation * (period - 1) + averageCourts
      : averageCourts;

    // used to increment cumulativeMatches
    // difference between current calculation and previous calculation
    // if no available courts then Zero so that cumulativeMatches does not increase
    // if available courts but no previously available courts then newCourts;
    const calculationDifference = !availableCourts
      ? 0
      : previousAvailableCourts
      ? calculatedTotal - previousCalculation
      : newCourts;

    previousCalculation = calculatedTotal;
    previousAvailableCourts = availableCourts;
    cumulativeMatches += calculationDifference;

    const addToSchedule = parseInt(cumulativeMatches) - totalMatchUps;
    totalMatchUps += addToSchedule;

    return {
      periodStart,
      add: addToSchedule,
      availableCourts,
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
