import { addVenue as venueAdd } from '../../../../tournamentEngine/governors/venueGovernor/addVenue';

import { MISSING_TOURNAMENT_RECORDS } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function addVenue({ tournamentRecords, venue }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueAdd({ tournamentRecord, venue });
    if (result.error) return result;
  }

  return SUCCESS;
}
