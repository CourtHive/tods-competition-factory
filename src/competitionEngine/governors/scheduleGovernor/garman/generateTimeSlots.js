import { DateHHMM, timeToDate } from '../../../../utilities/dateTime';

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
