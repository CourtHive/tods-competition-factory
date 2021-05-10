import { competitionScheduleMatchUps } from '../../getters/matchUpsGetter';
import { getVenuesAndCourts } from '../../getters/venuesAndCourtsGetter';
import { extractTime, sameDay } from '../../../utilities/dateTime';
import { getScheduleTimes } from './garman/garman';
import { getMatchUpFormatTiming } from '../../../tournamentEngine/governors/scheduleGovernor/getMatchUpFormatTiming';

export function calculateScheduleTimes({
  tournamentRecords,
  startTime,
  endTime,
  date,

  averageMatchUpTime = 90,
  periodLength = 30,

  venueIds,
}) {
  const { courts: allCourts, venues } = getVenuesAndCourts({
    tournamentRecords,
  });

  const courts = allCourts.filter(
    (court) => !venueIds || venueIds.includes(court.venueId)
  );

  if (!startTime) {
    startTime = courts.reduce((minStartTime, court) => {
      const dateAvailability = court.dateAvailability?.find((availability) =>
        sameDay(date, availability.date)
      );
      const comparisonStartTime =
        dateAvailability?.startTime || court.startTime;

      return comparisonStartTime &&
        (!minStartTime ||
          new Date(comparisonStartTime) < new Date(minStartTime))
        ? comparisonStartTime
        : minStartTime;
    }, undefined);
  }

  if (!endTime) {
    endTime = courts.reduce((maxEndTime, court) => {
      const dateAvailability = court.dateAvailability?.find((availability) =>
        sameDay(date, availability.date)
      );
      const comparisonEndTime = dateAvailability?.endTime || court.endTime;

      return comparisonEndTime &&
        (!maxEndTime || new Date(comparisonEndTime) > new Date(maxEndTime))
        ? comparisonEndTime
        : maxEndTime;
    }, undefined);
  }

  // get a mapping of eventIds to category details
  const eventDetails = Object.assign(
    {},
    ...Object.keys(tournamentRecords)
      .map((tournamentId) =>
        (tournamentRecords[tournamentId].events || []).map((event) => ({
          [event.eventId]: { tournamentId, event },
        }))
      )
      .flat()
  );

  // Get an array of all matchUps scheduled for the date
  // some of them may have courts assigned and some may only have venueIds
  // need to reduce courts available for a given time period by the number of matchUps scheduled at a given venue
  const matchUpFilters = { scheduledDate: date };
  const { dateMatchUps } = competitionScheduleMatchUps({
    tournamentRecords,
    matchUpFilters,
  });
  const bookings = dateMatchUps?.map(({ eventId, schedule, matchUpFormat }) => {
    const { event, tournamentId } = eventDetails[eventId];
    const tournamentRecord = tournamentRecords[tournamentId];
    const { averageMinutes } = getMatchUpFormatTiming({
      matchUpFormat,
      tournamentRecord,
      event,
    });
    const booking = {
      averageMinutes,
      scheduledTime: extractTime(schedule.scheduledTime),
      venueId: schedule.venueId,
    };
    return booking;
  });

  const timingParameters = {
    date,
    courts,
    startTime,
    endTime,
    bookings,
    periodLength,
    averageMatchUpTime,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);

  // if no venueIds provided and there is only one venue, use it!
  const venueId = venues?.length === 1 ? venues[0].venueId : undefined;

  return { venueId, scheduleTimes };
}
