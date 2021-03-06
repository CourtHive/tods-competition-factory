import { addNotice, getDevContext } from '../../../global/globalState';
import { UUID, makeDeepCopy } from '../../../utilities';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  VENUE_EXISTS,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { ADD_VENUE } from '../../../constants/topicConstants';

export function addVenue({
  tournamentRecord,
  returnDetails,
  disableNotice,
  venue,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venue) return { error: MISSING_VALUE };

  if (!tournamentRecord.venues) tournamentRecord.venues = [];
  if (!venue.venueId) venue.venueId = UUID();

  const venueExists = tournamentRecord.venues.reduce(
    (exists, existingVenue) => {
      return exists || existingVenue.venueId === venue.venueId;
    },
    undefined
  );

  if (!venueExists) {
    tournamentRecord.venues.push(venue);
    if (!disableNotice) {
      addNotice({ topic: ADD_VENUE, payload: { venue } });
    }

    return getDevContext({ addVenue: true })
      ? { ...SUCCESS, venue: makeDeepCopy(venue) }
      : returnDetails
      ? venue
      : { ...SUCCESS };
  } else {
    return { error: VENUE_EXISTS };
  }
}
