import { generateRange } from '../../../../utilities/arrays';
import {
  DateHHMM,
  currentUTCDate,
  sameDay,
  zeroPad,
} from '../../../../utilities/dateTime';

export function timeToDate(time, date = undefined) {
  const [hours, minutes] = (time || '00:00').split(':').map(zeroPad);
  return date
    ? new Date(date).setHours(hours, minutes, 0, 0)
    : new Date().setHours(hours, minutes, 0, 0);
}

export function courtsAvailableAtPeriodStart({
  courts,
  date,
  periodStart,
  averageMatchUpTime,
  includeBookingTypes,
}) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpTime);

  const availableCourts = courts.filter((court) => {
    const available =
      Array.isArray(court.dateAvailability) &&
      court.dateAvailability.filter(sameDate).filter(enoughTime);
    return !!available.length;
  });

  const available = availableCourts.map((court) => ({
    locationId: court.locationId,
    identifier: court.identifier,
  }));
  return { available, count: available.length };

  function sameDate(courtDate) {
    return sameDay(courtDate.date, date);
  }
  function enoughTime(courtDate) {
    const timeSlots = generateTimeSlots({ courtDate, includeBookingTypes });
    const availableTimeSlots = timeSlots.filter(validTimeSlot);
    return !!availableTimeSlots.length;
  }

  function validTimeSlot(timeSlot) {
    const [startHours, startMinutes] = timeSlot.startTime.split(':');
    const slotStartTime = new Date().setHours(startHours, startMinutes, 0, 0);
    const [endHours, endMinutes] = timeSlot.endTime.split(':');
    const slotEndTime = new Date().setHours(
      parseInt(endHours),
      parseInt(endMinutes),
      0,
      0
    );
    if (slotStartTime > periodStartTime) {
      return false;
    }
    if (slotEndTime < periodEndTime) {
      return false;
    }

    const timeSlotMinutes = minutesDifference(slotStartTime, slotEndTime);
    return timeSlotMinutes > averageMatchUpTime;
  }
}

export function generateTimeSlots({ courtDate, includeBookingTypes = [] }) {
  const timeSlots = [];
  let startTime = timeToDate(courtDate.startTime);

  (courtDate.bookings || [])
    .filter(
      (booking) =>
        !booking.bookingType ||
        !includeBookingTypes.includes(booking.bookingType)
    )
    .forEach((booking) => {
      const timeSlot = {
        startTime: DateHHMM(startTime, { displaySeconds: false }),
        endTime: booking.startTime,
      };
      if (timeToDate(booking.startTime) > startTime) {
        timeSlots.push(timeSlot);
      }
      if (timeToDate(booking.endTime) > startTime) {
        startTime = timeToDate(booking.endTime);
      }
    });

  const timeSlot = {
    startTime: DateHHMM(startTime, { displaySeconds: false }),
    endTime: courtDate.endTime,
  };
  if (timeToDate(courtDate.endTime) > startTime) {
    timeSlots.push(timeSlot);
  }

  return timeSlots;
}

export function matchUpTiming({
  startTime = '8:00',
  endTime = '19:00',
  date = currentUTCDate(),
  periodLength = 30,
  averageMatchUpTime = 90,
  courts,
} = {}) {
  // value of previous calculation
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
      courts,
      date,
      periodStart,
      averageMatchUpTime,
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

function minutesDifference(date2, date1) {
  const dt2 = new Date(date2);
  const dt1 = new Date(date1);
  const diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60;
  return Math.abs(Math.round(diff));
}

function addMinutes(startDate, minutes) {
  const date = new Date(startDate);
  return date.getTime() + minutes * 60000;
}

const garman = {
  matchUpTiming,
  generateTimeSlots,
  courtsAvailableAtPeriodStart,
};

export default garman;
