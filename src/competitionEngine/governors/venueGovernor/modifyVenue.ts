import { modifyVenue as venueModify } from '../../../tournamentEngine/governors/venueGovernor/modifyVenue';
import { checkAndUpdateSchedulingProfile } from '../scheduleGovernor/schedulingProfile/schedulingProfile';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { Tournament } from '../../../types/tournamentTypes';

type ModifyVenueArgs = {
  tournamentRecords: { [key: string]: Tournament };
  modifications: any;
  venueId: string;
  force?: boolean;
};
export function modifyVenue({
  tournamentRecords,
  modifications,
  venueId,
  force,
}: ModifyVenueArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venueId !== 'string') return { error: MISSING_VENUE_ID };

  let error;
  let success;
  // in this case suppress NOT FOUND errors if there is at least one success
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueModify({
      tournamentRecord,
      modifications,
      venueId,
      force,
    });
    if (result.success) success = true;
    if (result.error) error = result.error;
    if (result.error && result.error !== VENUE_NOT_FOUND) return result;
  }

  checkAndUpdateSchedulingProfile({ tournamentRecords });

  return success ? { ...SUCCESS } : { error };
}
