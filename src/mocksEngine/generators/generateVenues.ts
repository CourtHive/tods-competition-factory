import { addCourts } from '../../tournamentEngine/governors/venueGovernor/addCourt';
import { addVenue } from '../../tournamentEngine/governors/venueGovernor/addVenue';
import { dateRange, formatDate } from '../../utilities/dateTime';
import { UUID } from '../../utilities';
import { Tournament } from '../../types/tournamentFromSchema';

type GenerateVenuesArgs = {
  tournamentRecord: Tournament;
  venueProfiles: any[];
  uuids?: string[];
};
export function generateVenues({
  tournamentRecord,
  venueProfiles,
  uuids,
}: GenerateVenuesArgs) {
  const { startDate, endDate } = tournamentRecord;
  const venueIds: string[] = [];

  for (const [index, venueProfile] of venueProfiles.entries()) {
    const {
      venueAbbreviation,
      venueId = uuids?.pop() || UUID(),
      dateAvailability,
      startTime = '07:00',
      endTime = '19:00',
      courtTimings,
      courtsCount,
      courtNames,
      venueName,
      idPrefix,
      courtIds,
    } = venueProfile;

    const newVenue = {
      venueName: venueName || `Venue ${index + 1}`,
      venueAbbreviation,
      venueId,
    };
    const result = addVenue({ tournamentRecord, venue: newVenue });
    if (result.error) return result;

    venueIds.push(venueId);

    const dates = dateRange(startDate, endDate);
    const generatedDateAvailability =
      !Array.isArray(dateAvailability) &&
      [{ startTime, endTime }].concat(
        dates.map((date) => ({
          date: formatDate(date),
          startTime,
          endTime,
        }))
      );

    const addResult = addCourts({
      dateAvailability: dateAvailability || generatedDateAvailability,
      tournamentRecord,
      courtTimings,
      courtsCount,
      courtNames,
      startTime,
      idPrefix,
      courtIds,
      endTime,
      venueId,
      dates,
    });
    if (addResult.error) return addResult;
  }

  return venueIds;
}
