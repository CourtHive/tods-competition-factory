import {
  extractTime,
  minutesDifference,
  timeToDate,
} from '../../../../utilities/dateTime';
import { getCourtDateFilters } from './courtDateFilters';
import { generateTimeSlots } from './generateTimeSlots';

/**
 *
 * @param {object[]} bookings - array of booking objects that occur on the specified date
 * @param {object[]} courts - array of court objects
 * @param {string} date - the date on which the unassigned bookings are to be added to virtual courts
 *
 * @returns {object[]} virtualCourts - array of court objects to which unassigned bookings have been added
 */
export function getVirtualCourtBookings({
  averageMatchUpMinutes,
  // periodLength,
  startTime,
  endTime,
  bookings,
  courts,
  date,
}) {
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

  /*
  console.log({
    unassignedBookings: unassignedBookings.map(({ startTime, endTime }) => ({
      startTime,
      endTime,
    })),
  });
  */

  const virtualCourts = courts.map(({ courtId, dateAvailability }) => ({
    courtId,
    dateAvailability: dateAvailability?.map(
      ({ date, startTime, endTime, bookings }) => ({
        date,
        startTime,
        endTime,
        bookings: bookings?.map((booking) => booking),
      })
    ),
  }));

  const assignedBookings = [];
  const { sameDate } = getCourtDateFilters({ date });
  unassignedBookings.forEach((unassignedBooking) => {
    const { startTime, endTime } = unassignedBooking;
    const bookingStartTime = timeToDate(startTime);
    const bookingEndTime = timeToDate(endTime);
    const bookingRequiredMinutes = minutesDifference(
      bookingStartTime,
      bookingEndTime
    );

    virtualCourts.find((court) => {
      if (!Array.isArray(court.dateAvailability)) return false;
      const dateAvailability = court.dateAvailability.filter(sameDate);
      return dateAvailability.find((courtDate) => {
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
            const booking = { startTime, endTime, bookingType: 'virtual' };
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
