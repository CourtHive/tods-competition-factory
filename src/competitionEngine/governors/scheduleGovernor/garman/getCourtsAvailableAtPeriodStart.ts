import { Court } from '../../../../types/tournamentFromSchema';
import { addMinutes, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateAvailability } from './getCourtDateAvailability';
import { getEnoughTime } from './getEnoughTime';

type GetCourtsAvailableAtPeriodStartArgs = {
  averageMatchUpMinutes: number;
  includeBookingTypes?: boolean;
  periodStart: string;
  courts: any[];
  date: string;
};
export function getCourtsAvailableAtPeriodStart(
  params: GetCourtsAvailableAtPeriodStartArgs
) {
  const { averageMatchUpMinutes, includeBookingTypes, periodStart, date } =
    params;
  const courts = params.courts as Court[];
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpMinutes);

  const { enoughTime } = getEnoughTime({
    averageMatchUpMinutes,
    includeBookingTypes,
    periodStartTime,
    periodEndTime,
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
