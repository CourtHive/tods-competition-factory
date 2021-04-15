import { venueTemplate } from '../../generators/venueTemplate';
import { addNotice, getDevContext } from '../../../global/globalState';
import { UUID, makeDeepCopy } from '../../../utilities';

import { VENUE_EXISTS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { ADD_VENUE } from '../../../constants/topicConstants';

export function addVenue({ tournamentRecord, venue }) {
  if (!tournamentRecord.venues) tournamentRecord.venues = [];

  const venueRecord = Object.assign({}, venueTemplate(), venue);
  if (!venueRecord.venueId) venueRecord.venueId = UUID();

  const venueExists = tournamentRecord.venues.reduce((exists, venue) => {
    return exists || venue.venueId === venueRecord.venueId;
  }, undefined);

  if (!venueExists) {
    tournamentRecord.venues.push(venueRecord);
    addNotice({ topic: ADD_VENUE, payload: { venue: venueRecord } });

    return getDevContext()
      ? Object.assign({}, { venue: makeDeepCopy(venueRecord) }, SUCCESS)
      : SUCCESS;
  } else {
    return { error: VENUE_EXISTS };
  }
}
