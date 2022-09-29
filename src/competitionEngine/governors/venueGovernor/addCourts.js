import { addCourts as courtsAdd } from '../../../tournamentEngine/governors/venueGovernor/addCourt';
import { findVenue } from '../../../tournamentEngine/getters/venueGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addCourts(params) {
  const { tournamentRecords, venueId } = params;
  if (typeof venueId !== 'string' || !venueId)
    return { error: MISSING_VENUE_ID };

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
