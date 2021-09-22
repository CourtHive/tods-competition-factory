import { isValidDateString } from '../../../../utilities/dateTime';
import { getCourtDateFilters } from '../garman/courtDateFilters';
import { makeDeepCopy } from '../../../../utilities';

import {
  INVALID_BOOKINGS,
  INVALID_DATE,
  INVALID_VALUES,
} from '../../../../constants/errorConditionConstants';

export function generateVirtualCourts({
  remainingScheduleTimes = [],
  bookings = [],
  scheduleDate,
  courts = [],
}) {
  if (!Array.isArray(courts) || !courts.length)
    return { error: INVALID_VALUES, courts };
  if (!Array.isArray(bookings)) return { error: INVALID_BOOKINGS };
  if (!isValidDateString(scheduleDate)) return { error: INVALID_DATE };

  const { courtBookings, unassignedBookings } = bookings.reduce(
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

  const { sameDate } = getCourtDateFilters({ date: scheduleDate });
  const virtualCourts = courts.map(({ courtId, dateAvailability }, index) => {
    const bookingsThisCourt = courtBookings[courtId] || [];
    return {
      courtId,
      dateAvailability: dateAvailability
        ?.filter(sameDate)
        .map(
          ({ date, startTime, endTime, bookings: existingBookings = [] }) => {
            const allocatedTimeBooking = remainingScheduleTimes[index] && {
              startTime,
              endTime: remainingScheduleTimes[index],
            };
            const amendedBookings = [
              allocatedTimeBooking,
              ...makeDeepCopy(existingBookings, false, true),
              ...bookingsThisCourt,
            ].filter(Boolean);
            return {
              date,
              startTime,
              endTime,
              bookings: amendedBookings,
            };
          }
        ),
    };
  });

  for (const unassignedBooking of unassignedBookings) {
    if (unassignedBooking) {
      //
    }
  }

  return { virtualCourts };
}
