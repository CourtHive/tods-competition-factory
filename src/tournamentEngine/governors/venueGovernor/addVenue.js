import { UUID, makeDeepCopy } from '../../../utilities';
import { venueTemplate } from '../../generators/venueTemplate';

import { VENUE_EXISTS } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function addVenue({ tournamentRecord, venue }) {
  if (!tournamentRecord.venues) tournamentRecord.venues = [];

  const venueRecord = Object.assign({}, venueTemplate(), venue);
  if (!venueRecord.venueId) venueRecord.venueId = UUID();

  const venueExists = tournamentRecord.venues.reduce((exists, venue) => {
    return exists || venue.venueId === venueRecord.venueId;
  }, undefined);

  if (!venueExists) {
    tournamentRecord.venues.push(venueRecord);
    return Object.assign({}, { venue: makeDeepCopy(venueRecord) }, SUCCESS);
  } else {
    return { error: VENUE_EXISTS };
  }
}
