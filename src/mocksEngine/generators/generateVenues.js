import { addVenue } from '../../tournamentEngine/governors/venueGovernor/addVenue';
import { addCourts } from '../../tournamentEngine/governors/venueGovernor/addCourt';
import { dateRange, formatDate } from '../../utilities/dateTime';
import { UUID } from '../../utilities';

export function generateVenues({ tournamentRecord, venueProfiles }) {
  const { startDate, endDate } = tournamentRecord;
  let venueIds = [];

  for (const [index, venueProfile] of venueProfiles.entries()) {
    let {
      venueId = UUID(),
      venueName,
      courtsCount,
      dateAvailability,
      startTime = '07:00',
      endTime = '19:00',
    } = venueProfile;

    const newVenue = {
      venueId,
      venueName: venueName || `Venue ${index + 1}`,
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
      venueId,
      courtsCount,
      dateAvailability,
    });
    if (result.error) return result;
  }

  return venueIds;
}
