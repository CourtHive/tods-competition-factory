import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateFilters } from './courtDateFilters';
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
    const { sameDate } = getCourtDateFilters({ date });

    const availableCourt = virtualCourts.find((court) => {
      if (!Array.isArray(court.dateAvailability)) return false;
      const dateAvailability = court.dateAvailability.filter(sameDate);
      const available = dateAvailability.find((availability) => {
        const bookingStartTime = timeToDate(startTime);
        const bookingEndTime = timeToDate(endTime);
        const availabilityStartTime = timeToDate(availability.startTime);
        const availabilityEndTime = timeToDate(availability.endTime);
        if (availabilityStartTime > bookingStartTime) return false;
        if (availabilityEndTime < bookingEndTime) return false;
        const bookingRequiredMinutes = minutesDifference(
          bookingStartTime,
          bookingEndTime
        );
        const availabilityMinutes = minutesDifference(
          availabilityStartTime,
          availabilityEndTime
        );
        return availabilityMinutes >= bookingRequiredMinutes;
      });
      return available;
    });

    if (availableCourt) {
      // assign booking to court
    }
  });

  return { virtualCourts };
}
