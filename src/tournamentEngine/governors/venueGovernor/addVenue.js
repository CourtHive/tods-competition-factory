import { venueTemplate } from '../../generators/venueTemplate';
import { getDevContext } from '../../../global/globalState';
import { UUID, makeDeepCopy } from '../../../utilities';

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
    return getDevContext()
      ? Object.assign({}, { venue: makeDeepCopy(venueRecord) }, SUCCESS)
      : SUCCESS;
  } else {
    return { error: VENUE_EXISTS };
  }
}
