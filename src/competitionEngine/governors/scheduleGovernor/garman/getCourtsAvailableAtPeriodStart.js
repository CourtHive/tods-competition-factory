import { addMinutes, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateFilters } from './courtDateFilters';

export function courtsAvailableAtPeriodStart({
  includeBookingTypes,
  averageMatchUpTime,
  periodStart,
  courts,
  date,
}) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpTime);

  const { sameDate, enoughTime } = getCourtDateFilters({
    includeBookingTypes,
    averageMatchUpTime,
    periodStartTime,
    periodEndTime,
    date,
  });

  const availableCourts = courts.filter((court) => {
    // add any matches already scheduled for this court
    // court.dateAvailbility.bookings.push(...(courtBookings[court.courtId] || []))
    const available =
      Array.isArray(court.dateAvailability) &&
      court.dateAvailability.filter(sameDate).filter(enoughTime);
    return !!available.length;
  });

  return {
    availableToScheduleCount: availableCourts.length,
  };
}
