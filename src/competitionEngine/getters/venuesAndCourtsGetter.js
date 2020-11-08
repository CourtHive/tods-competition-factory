import { makeDeepCopy } from '../../utilities';
import { MISSING_TOURNAMENT_RECORDS } from '../../constants/errorConditionConstants';

export function getVenuesAndCourts({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  const venues = [];
  const courts = [];
  const uniqueVenueIds = [];
  const uniqueCourtIds = [];

  const tournamentIds = Object.keys(tournamentRecords);
  tournamentIds.forEach(tournamentId => {
    const tournamentRecord = tournamentRecords[tournamentId];
    tournamentRecord.venues.forEach(venue => {
      if (!uniqueVenueIds.includes(venue.venueId)) {
        venues.push(makeDeepCopy(venue));
      }
      venue.courts.forEach(court => {
        if (!uniqueCourtIds.includes(court.courtId)) {
          const inContextCourt = Object.assign({}, makeDeepCopy(court), {
            venueId: venue.venueId,
          });
          courts.push(inContextCourt);
        }
      });
    });
  });

  return { courts, venues };
}
