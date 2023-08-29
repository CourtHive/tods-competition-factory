import { deleteVenue as venueDelete } from '../../../tournamentEngine/governors/venueGovernor/deleteVenue';
import { checkSchedulingProfile } from '../scheduleGovernor/schedulingProfile/schedulingProfile';

import { TournamentRecordsArgs } from '../../../types/factoryTypes';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

type DeleteVenueArgs = TournamentRecordsArgs & {
  venueId: string;
  force?: boolean;
};
export function deleteVenue({
  tournamentRecords,
  venueId,
  force,
}: DeleteVenueArgs) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venueId !== 'string') return { error: MISSING_VENUE_ID };

  let deleted;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueDelete({ tournamentRecord, venueId, force });
    if (result.error && result.error !== VENUE_NOT_FOUND) return result;
    if (result.success) deleted = true;
  }

  checkSchedulingProfile({ tournamentRecords });

  // NOTE: Consider what to do with references to venueId that are in matchUp timeItems

  return deleted ? SUCCESS : { error: VENUE_NOT_FOUND };
}
