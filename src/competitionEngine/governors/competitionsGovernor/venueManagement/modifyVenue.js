import { modifyVenue as venueModify } from '../../../../tournamentEngine/governors/venueGovernor/modifyVenue';

import { SUCCESS } from '../../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';

export function modifyVenue({
  tournamentRecords,
  venueId,
  modifications,
  force,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venueId !== 'string') return { error: MISSING_VENUE_ID };

  let error;
  let success;
  // in this case suppress NOT FOUND errors if there is at least one success
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueModify({
      tournamentRecord,
      venueId,
      modifications,
      force,
    });
    if (result.success) success = true;
    if (result.error) error = result.error;
    if (result.error && result.error !== VENUE_NOT_FOUND) return result;
  }
  return success ? SUCCESS : { error };
}
