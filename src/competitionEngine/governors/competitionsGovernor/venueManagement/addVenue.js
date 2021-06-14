import { addVenue as venueAdd } from '../../../../tournamentEngine/governors/venueGovernor/addVenue';
import { addNotice } from '../../../../global/globalState';
import { UUID } from '../../../../utilities';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { ADD_VENUE } from '../../../../constants/topicConstants';

export function addVenue({ tournamentRecords, venue, disableNotice }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venue !== 'object') return { error: INVALID_VALUES };

  if (!venue.venueId) venue.venueId = UUID();
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueAdd({
      tournamentRecord,
      returnDetails: true,
      disableNotice: true,
      venue,
    });
    if (result?.error) return result;
  }

  if (!disableNotice) {
    addNotice({ topic: ADD_VENUE, payload: { venue } });
  }

  return SUCCESS;
}
