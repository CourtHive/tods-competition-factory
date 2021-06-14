import { addVenue as venueAdd } from '../../../../tournamentEngine/governors/venueGovernor/addVenue';
import { addNotice } from '../../../../global/globalState';

import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { ADD_VENUE } from '../../../../constants/topicConstants';

export function addVenue({ tournamentRecords, venue, disableNotice }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof venue !== 'object') return { error: INVALID_VALUES };

  let venueRecord;
  let venueId = venue?.venueId;
  for (const tournamentRecord of Object.values(tournamentRecords)) {
    Object.assign(venue, { venueId });
    const result = venueAdd({
      tournamentRecord,
      venue,
      returnDetails: true,
      disableNotice: true,
    });
    venueId = venueId || result.venue?.venueId;
    venueRecord = venueRecord || result.venue;
    if (result?.error) return result;
  }

  if (!disableNotice && venueRecord) {
    addNotice({ topic: ADD_VENUE, payload: { venue: venueRecord } });
  }

  return SUCCESS;
}
