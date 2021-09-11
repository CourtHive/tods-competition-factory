import { getCourtDateFilters } from './courtDateFilters';
import { generateTimeSlots } from './generateTimeSlots';
import {
  extractTime,
  minutesDifference,
  timeToDate,
} from '../../../../utilities/dateTime';

/**
 *
 * @param {object[]} bookings - array of booking objects that occur on the specified date
 * @param {object[]} courts - array of court objects
 * @param {string} date - the date on which the unassigned bookings are to be added to virtual courts
 *
 * @returns {object[]} virtualCourts - array of court objects to which unassigned bookings have been added
 */
export function getVirtualCourts({
  averageMatchUpMinutes,
  remainingScheduleTimes = [],
  startTime,
  endTime,
  bookings,
  courts,
  date,
}) {
  const { sameDate } = getCourtDateFilters({ date });
  const virtualCourts = courts.map(({ courtId, dateAvailability }, index) => ({
    courtId,
    dateAvailability: dateAvailability
      ?.filter(sameDate)
      .map(({ date, startTime, endTime, bookings }) => {
        const amendedBookings = [];
        const allocatedTimeBooking = remainingScheduleTimes[index] && {
          startTime,
          endTime: remainingScheduleTimes[index],
          bookingType: 'remainingScheduleTime',
        };
        if (allocatedTimeBooking) amendedBookings.push(allocatedTimeBooking);
        if (Array.isArray(bookings)) {
          amendedBookings.push(...bookings?.map((booking) => booking));
        }
        return {
          date,
          startTime,
          endTime,
          bookings: amendedBookings,
        };
      }),
  }));

  const { unassignedBookings } = (bookings || []).reduce(
    (accumulator, booking) => {
      const { courtId } = booking;
      if (courtId) {
        if (!accumulator.courtBookings[courtId]) {
          accumulator.courtBookings[courtId] = [booking];
        } else {
          accumulator.courtBookings[courtId].push(booking);
        }
      } else {
        accumulator.unassignedBookings.push(booking);
      }
      return accumulator;
    },
    { courtBookings: {}, unassignedBookings: [] }
  );

  const assignedBookings = [];
  unassignedBookings.forEach((unassignedBooking) => {
    const {
      startTime,
      endTime,
      matchUpId,
      averageMinutes,
      recoveryMinutes,
      periodLength,
    } = unassignedBooking;
    const bookingStartTime = timeToDate(startTime);
    const bookingEndTime = timeToDate(endTime);
    const bookingRequiredMinutes = minutesDifference(
      bookingStartTime,
      bookingEndTime
    );

    virtualCourts.find((court) => {
      // court.dateAvailability is an array of at most one courtDate object
      return court.dateAvailability.find((courtDate) => {
        const timeSlots = generateTimeSlots({ courtDate });
        return timeSlots.find((timeSlot) => {
          const timeSlotStartTime = timeToDate(timeSlot.startTime);
          const timeSlotEndTime = timeToDate(timeSlot.endTime);
          if (timeSlotStartTime > bookingStartTime) return false;
          if (timeSlotEndTime < bookingEndTime) return false;
          const timeSlotMinutes = minutesDifference(
            timeSlotStartTime,
            timeSlotEndTime
          );
          const available = timeSlotMinutes >= bookingRequiredMinutes;
          if (available) {
            if (!courtDate.bookings) courtDate.bookings = [];
            const booking = {
              bookingType: 'virtual',
              averageMinutes,
              recoveryMinutes,
              periodLength,
              matchUpId,
              startTime,
              endTime,
            };
            assignedBookings.push(booking);
            courtDate.bookings.push(booking);
          }
          return available;
        });
      });
    });
  });
  // console.log({ assignedBookings });

  // find the first timeSlot across all courts between startTime and endTime that can accommodate averageMatchUpMinutes
  let firstTimeSlotStartTime;
  if (startTime && endTime) {
    const dateStartTime = timeToDate(startTime);
    const dateEndTime = timeToDate(endTime);
    virtualCourts.every((court) => {
      if (!Array.isArray(court.dateAvailability)) return false;
      const dateAvailability = court.dateAvailability.filter(sameDate);
      return dateAvailability.find((courtDate) => {
        const timeSlots = generateTimeSlots({ courtDate });
        return timeSlots.find((timeSlot) => {
          const timeSlotStartTime = timeToDate(timeSlot.startTime);
          const timeSlotEndTime = timeToDate(timeSlot.endTime);
          if (
            timeSlotStartTime > dateEndTime ||
            timeSlotStartTime < dateStartTime
          )
            return false;
          if (timeSlotEndTime < dateStartTime) return false;
          const timeSlotMinutes = minutesDifference(
            timeSlotStartTime,
            timeSlotEndTime
          );
          const available = timeSlotMinutes >= averageMatchUpMinutes;
          if (available) {
            const timeString = extractTime(timeSlotStartTime.toISOString());
            if (
              !firstTimeSlotStartTime ||
              timeString < firstTimeSlotStartTime
            ) {
              firstTimeSlotStartTime = timeString;
            }
          }
          return available;
        });
      });
    });
  }

  return { virtualCourts, firstTimeSlotStartTime };
}
