import { addCourts } from '../../tournamentEngine/governors/venueGovernor/addCourt';
import { addVenue } from '../../tournamentEngine/governors/venueGovernor/addVenue';
import { dateRange, formatDate } from '../../utilities/dateTime';
import { UUID } from '../../utilities';

export function generateVenues({ tournamentRecord, venueProfiles }) {
  const { startDate, endDate } = tournamentRecord;
  let venueIds = [];

  for (const [index, venueProfile] of venueProfiles.entries()) {
    let {
      venueAbbreviation,
      venueId = UUID(),
      dateAvailability,
      startTime = '07:00',
      endTime = '19:00',
      courtTimings,
      courtsCount,
      courtNames,
      venueName,
      courtIds,
    } = venueProfile;

    const newVenue = {
      venueName: venueName || `Venue ${index + 1}`,
      venueAbbreviation,
      venueId,
    };
    let result = addVenue({ tournamentRecord, venue: newVenue });
    if (result.error) return result;

    venueIds.push(venueId);

    const dates = dateRange(startDate, endDate);
    dateAvailability =
      (!Array.isArray(dateAvailability) &&
        dates.map((date) => ({
          date: formatDate(date),
          startTime,
          endTime,
        }))) ||
      dateAvailability;

    result = addCourts({
      tournamentRecord,
      dateAvailability,
      courtTimings,
      courtsCount,
      courtNames,
      startTime,
      courtIds,
      endTime,
      venueId,
      dates,
    });
    if (result.error) return result;
  }

  return venueIds;
}
