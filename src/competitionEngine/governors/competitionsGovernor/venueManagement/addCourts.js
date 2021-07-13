import { addCourts as courtsAdd } from '../../../../tournamentEngine/governors/venueGovernor/addCourt';
import { findVenue } from '../../../../tournamentEngine/getters/venueGetter';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  VENUE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export function addCourts(params) {
  const { tournamentRecords, venueId } = params || {};
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };

  let success;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const { venue } = findVenue({ tournamentRecord, venueId });
    if (venue) {
      const result = courtsAdd({ tournamentRecord, ...params });
      if (result.error) return result;
      success = true;
    }
  }

  return success ? SUCCESS : { error: VENUE_NOT_FOUND };
}
