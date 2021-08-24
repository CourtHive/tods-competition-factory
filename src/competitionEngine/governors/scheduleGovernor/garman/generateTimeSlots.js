import { timeToDate, extractTime } from '../../../../utilities/dateTime';

/**
 *
 * @param {object} courtDate - object containing court details for a specific date { date, startTime, endTime, bookings }
 * @param {string[]} includeBookingTypes - include bookings which are present in this array as "available time"
 * @returns {object[]} - an array of timeSlots consisting of { startTime, endTime }
 */
export function generateTimeSlots({ courtDate, includeBookingTypes = [] }) {
  const timeSlots = [];
  let startTime = timeToDate(courtDate.startTime);

  (courtDate.bookings || [])
    .filter(
      (booking) =>
        !booking.bookingType ||
        !includeBookingTypes.includes(booking.bookingType)
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .forEach((booking) => {
      const timeSlot = {
        startTime: extractTime(startTime.toISOString()),
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
    startTime: extractTime(startTime.toISOString()),
    endTime: courtDate.endTime,
  };
  if (timeToDate(courtDate.endTime) > startTime) {
    timeSlots.push(timeSlot);
  }

  return timeSlots;
}
