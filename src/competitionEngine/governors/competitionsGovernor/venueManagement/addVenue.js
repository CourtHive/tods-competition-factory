import { addVenue as venueAdd } from '../../../../tournamentEngine/governors/venueGovernor/addVenue';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function addVenue({ tournamentRecords, venue }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  let venueId = venue?.venueId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    Object.assign(venue, { venueId });
    const result = venueAdd({ tournamentRecord, venue, returnDetails: true });
    venueId = venueId || result.venue?.venueId;
    if (result.error) return result;
  }

  return SUCCESS;
}
