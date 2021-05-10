import { generateTimeSlots } from './generateTimeSlots';
import {
  addMinutes,
  minutesDifference,
  offsetDate,
  sameDay,
  timeToDate,
} from '../../../../utilities/dateTime';

export function courtsAvailableAtPeriodStart({
  includeBookingTypes,
  averageMatchUpTime,
  periodStart,
  bookings,
  courts,
  date,
}) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpTime);

  const { courtBookings, unassignedBookings } = (bookings || []).reduce(
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
  if (Object.keys(courtBookings).length)
    console.log({ courtBookings, unassignedBookings });

  const availableCourts = courts.filter((court) => {
    // add any matches already scheduled for this court
    // court.dateAvailbility.bookings.push(...(courtBookings[court.courtId] || []))
    const available =
      Array.isArray(court.dateAvailability) &&
      court.dateAvailability.filter(sameDate).filter(enoughTime);
    return !!available.length;
  });

  const available = availableCourts.map((court) => ({
    courtId: court.courtId,
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
    const slotStartTime = offsetDate(
      new Date().setHours(startHours, startMinutes, 0, 0)
    );
    const [endHours, endMinutes] = timeSlot.endTime.split(':');
    const slotEndTime = offsetDate(
      new Date().setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)
    );
    if (slotStartTime > periodStartTime) {
      return false;
    }
    if (slotEndTime < periodEndTime) {
      return false;
    }

    const timeSlotMinutes = minutesDifference(periodStartTime, slotEndTime);
    return timeSlotMinutes >= averageMatchUpTime;
  }
}
