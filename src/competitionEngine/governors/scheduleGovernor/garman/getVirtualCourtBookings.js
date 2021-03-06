import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateFilters } from './courtDateFilters';
import { generateTimeSlots } from './generateTimeSlots';
import { makeDeepCopy } from '../../../../utilities';

/**
 *
 * @param {object[]} bookings - array of booking objects that occur on the specified date
 * @param {object[]} courts - array of court objects
 * @param {string} date - the date on which the unassigned bookings are to be added to virtual courts
 *
 * @returns {object[]} virtualCourts - array of court objects to which unassigned bookings have been added
 */
export function getVirtualCourtBookings({ bookings, courts, date }) {
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
  const virtualCourts = makeDeepCopy(courts, false, true);

  unassignedBookings.forEach((unassignedBooking) => {
    const { startTime, endTime } = unassignedBooking;
    const bookingStartTime = timeToDate(startTime);
    const bookingEndTime = timeToDate(endTime);
    const bookingRequiredMinutes = minutesDifference(
      bookingStartTime,
      bookingEndTime
    );
    const { sameDate } = getCourtDateFilters({ date });

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
            const booking = { startTime, endTime, bookingType: 'matchUp' };
            courtDate.bookings.push(booking);
          }
          return available;
        });
      });
    });
  });

  return { virtualCourts };
}
