import { addVenue as venueAdd } from '../../../tournamentEngine/governors/venueGovernor/addVenue';
import { definedAttributes } from '../../../utilities/objects';
import { addNotice } from '../../../global/state/globalState';
import { UUID } from '../../../utilities';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { ADD_VENUE } from '../../../constants/topicConstants';

export function addVenue({ tournamentRecords, disableNotice, venue, context }) {
  if (typeof venue !== 'object') return { error: INVALID_VALUES };

  if (!venue.venueId) venue.venueId = UUID();

  let addedVenue;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = venueAdd({
      disableNotice: true,
      tournamentRecord,
      context,
      venue,
    });
    if (result?.error) return result;
    addedVenue = result.venue;
  }

  if (!disableNotice) {
    addNotice({ topic: ADD_VENUE, payload: { venue } });
  }

  return definedAttributes({ ...SUCCESS, venue: addedVenue });
}
