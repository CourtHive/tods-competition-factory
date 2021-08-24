import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';
import { allCompetitionMatchUps } from '../../getters/matchUpsGetter';
import {
  addMinutesToTimeString,
  extractTime,
  sameDay,
  timeStringMinutes,
} from '../../../utilities/dateTime';

import {
  INVALID_VALUE,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { generateTimeSlots } from '../scheduleGovernor/garman/generateTimeSlots';

export function getVenuesReport({ tournamentRecords, venueIds, dates = [] }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(dates)) return { error: INVALID_VALUE, dates };

  const result = getVenuesAndCourts({ tournamentRecords });
  if (result.error) return result;

  const venues = result.venues.filter(
    ({ venueId }) => !venueIds?.length || venueIds.includes(venueId)
  );

  const courtDates = result.courts
    .reduce((dates, court) => {
      court.dateAvailability.forEach(({ date }) => {
        if (!dates.includes(date)) dates.push(date);
      });
      return dates;
    }, [])
    .filter((date) => !dates.length || dates.includes(date));

  const matchUpFilters = { venueIds: venues.map(({ venueId }) => venueId) };
  const { matchUps } = allCompetitionMatchUps({
    tournamentRecords,
    matchUpFilters,
  });

  const venuesReport = venues.map((venue) =>
    getVenueReport(courtDates, venue, matchUps)
  );
  return { venuesReport };
}

function getVenueReport(dates, venue, matchUps) {
  const { venueId, courts, venueName } = venue;

  const venueReport = {};

  dates.forEach((date) => {
    // for each venue court calculate the available minutes on specified date
    let availableMinutes = 0,
      scheduledMinutes = 0,
      availableCourts = 0;
    for (const court of courts) {
      const courtDate = court.dateAvailability.find(
        (availability) => availability.date === date
      );
      const timeSlots = courtDate && generateTimeSlots({ courtDate });
      const courtAvailableMinutes = timeSlots?.reduce((minutes, timeSlot) => {
        const { startTime, endTime } = timeSlot;
        const timeSlotMinutes =
          timeStringMinutes(endTime) - timeStringMinutes(startTime);
        return minutes + timeSlotMinutes;
      }, 0);
      if (courtAvailableMinutes) availableCourts += 1;
      availableMinutes += courtAvailableMinutes;
    }
    const venueMatchUps = matchUps.filter(
      ({ schedule }) =>
        schedule.venueId === venueId && sameDay(date, schedule.scheduledDate)
    );
    venueMatchUps.forEach(({ schedule }) => {
      const startTime = extractTime(schedule.scheduledTime);
      const endTime = addMinutesToTimeString(
        startTime,
        schedule.averageMinutes
      );
      const matchUpScheduledMinutes =
        timeStringMinutes(endTime) - timeStringMinutes(startTime);
      scheduledMinutes += matchUpScheduledMinutes;
    });

    const percentUtilization = (
      (scheduledMinutes / availableMinutes) *
      100
    ).toFixed(2);
    venueReport[date] = {
      scheduledMatchUpsCount: venueMatchUps.length,
      availableCourts,
      availableMinutes,
      scheduledMinutes,
      percentUtilization,
    };
  });

  return {
    venueId,
    venueName,
    venueReport,
  };
}
