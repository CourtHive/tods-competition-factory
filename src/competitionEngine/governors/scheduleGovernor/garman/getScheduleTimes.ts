import { getCourtsAvailableAtPeriodStart } from './getCourtsAvailableAtPeriodStart';
import { generateVirtualCourts } from '../schedulers/utils/generateVirtualCourts';
import { calculatePeriodLength } from '../schedulers/utils/calculatePeriodLength';
import { getFirstTimeSlotStartTime } from './getFirstTimeSlotStartTime';
import { generateRange } from '../../../../utilities/arrays';
import { courtGenerator } from './courtGenerator';
import {
  getUTCdateString,
  extractTime,
  extractDate,
  timeStringMinutes,
  dayMinutesToTimeString,
} from '../../../../utilities/dateTime';

export function getScheduleTimes(params) {
  let {
    date = getUTCdateString(),
    startTime = '08:00',
    endTime = '19:00',
    periodLength,
    courts,
  } = params;

  const {
    calculateStartTimeFromCourts = true,
    remainingScheduleTimes, // times remaining from previous scheduling iteration
    averageMatchUpMinutes,
    clearScheduleDates,
    courtsCount,
    bookings,
  } = params;

  periodLength =
    periodLength || calculatePeriodLength({ averageMatchUpMinutes });

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

  const { virtualCourts } = generateVirtualCourts({
    remainingScheduleTimes,
    clearScheduleDates,
    scheduleDate: date,
    periodLength,
    bookings,
    courts,
  });

  const { firstTimeSlotStartTime } = getFirstTimeSlotStartTime({
    averageMinutes: averageMatchUpMinutes,
    courts: virtualCourts,
    startTime,
    endTime,
    date,
  });

  if (calculateStartTimeFromCourts && firstTimeSlotStartTime) {
    startTime = firstTimeSlotStartTime ? firstTimeSlotStartTime : startTime;
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
      courts: virtualCourts || [],
      averageMatchUpMinutes,
      periodStart,
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
      : (previousAvailableCourts && calculatedTotal - previousCalculation) ||
        newCourts;

    previousCalculation = calculatedTotal;
    previousAvailableCourts = availableToScheduleCount;
    cumulativeMatches += calculationDifference;

    const stringifiedNumber = cumulativeMatches.toString();
    const addToSchedule = parseInt(stringifiedNumber) - totalMatchUps;
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
      const stRange: number[] = generateRange(0, profile.add);
      const newTimes: any[] = stRange.map(() => {
        const scheduleTime = profile.periodStart;
        return { scheduleTime };
      });
      return scheduleTimes.concat(...newTimes);
    }, [])
    .flat();

  return { scheduleTimes, timingProfile, totalMatchUps };
}
