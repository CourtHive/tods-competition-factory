import { deleteVenue as venueDelete } from '../../../../tournamentEngine/governors/venueGovernor/deleteVenue';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export function deleteVenue({ tournamentRecords, venueId, force }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venueId !== 'string') return { error: MISSING_VENUE_ID };

  let deleted;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    if (!tournamentRecord.venues) tournamentRecord.venues = [];

    const result = venueDelete({ tournamentRecord, venueId, force });
    if (result.error && result.error !== VENUE_NOT_FOUND) return result;
    deleted = true;
  }

  return deleted ? SUCCESS : { error: VENUE_NOT_FOUND };
}
