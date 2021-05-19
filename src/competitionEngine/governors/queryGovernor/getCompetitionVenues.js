import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../constants/errorConditionConstants';
import { getVenues } from '../../../tournamentEngine/getters/venueGetter';

export function getCompetitionVenues({ tournamentRecords }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof tournamentRecords !== 'object') return { error: INVALID_VALUES };

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
