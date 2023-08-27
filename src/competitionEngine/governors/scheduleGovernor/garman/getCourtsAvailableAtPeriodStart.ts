import { addMinutes, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateAvailability } from './getCourtDateAvailability';
import { getEnoughTime } from './getEnoughTime';

type GetCourtsAvailableAtPeriodStartArgs = {
  averageMatchUpMinutes: number;
  includeBookingTypes?: boolean;
  periodLength?: number;
  periodStart: string;
  courts: any[];
  date: string;
};
export function getCourtsAvailableAtPeriodStart({
  averageMatchUpMinutes,
  includeBookingTypes,
  periodLength,
  periodStart,
  courts,
  date,
}: GetCourtsAvailableAtPeriodStartArgs) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpMinutes);

  const { enoughTime } = getEnoughTime({
    averageMatchUpMinutes,
    includeBookingTypes,
    periodStartTime,
    periodEndTime,
    periodLength,
  });

  const availableCourts =
    courts?.filter((court) => {
      if (!Array.isArray(court.dateAvailability)) return false;
      const courtDate = getCourtDateAvailability({ date, court });
      return !!(courtDate && enoughTime(courtDate));
    }) || [];

  return {
    availableToScheduleCount: availableCourts.length,
  };
}
