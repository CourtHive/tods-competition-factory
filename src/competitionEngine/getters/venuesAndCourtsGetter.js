import { makeDeepCopy } from '../../utilities';
import { getVenues } from '../../tournamentEngine/getters/venueGetter';
import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';

export function getVenuesAndCourts({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const venues = [];
  const courts = [];
  const uniqueVenueIds = [];
  const uniqueCourtIds = [];

  const tournamentIds = Object.keys(tournamentRecords);
  tournamentIds.forEach((tournamentId) => {
    const tournamentRecord = tournamentRecords[tournamentId];
    tournamentRecord.venues?.forEach((venue) => {
      if (!uniqueVenueIds.includes(venue.venueId)) {
        venues.push(makeDeepCopy(venue));
        uniqueVenueIds.push(venue.venueId);
      }
      venue.courts?.forEach((court) => {
        if (!uniqueCourtIds.includes(court.courtId)) {
          const inContextCourt = Object.assign({}, makeDeepCopy(court), {
            venueId: venue.venueId,
          });
          courts.push(inContextCourt);
          uniqueCourtIds.push(court.courtId);
        }
      });
    });
  });

  return { courts, venues };
}

export function getCompetitionVenues({ tournamentRecords }) {
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const tournamentIds = Object.keys(tournamentRecords);
  return tournamentIds.reduce(
    (accumulator, tournamentId) => {
      const tournamentRecord = tournamentRecords[tournamentId];
      const { venues } = getVenues({ tournamentRecord });
      venues.forEach((venue) => {
        const { venueId } = venue;
        if (!accumulator.venueIds.includes(venueId)) {
          accumulator.venues.push(venue);
          accumulator.venueIds.push(venueId);
        }
      });
      return accumulator;
    },
    { venues: [], venueIds: [] }
  );
}
