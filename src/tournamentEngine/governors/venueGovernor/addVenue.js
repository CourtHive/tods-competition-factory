import { UUID, makeDeepCopy } from '../../../utilities';
import { SUCCESS } from '../../../constants/resultConstants';
import { venueTemplate } from '../../generators/venueTemplate';

export function addVenue({tournamentRecord, venue}) {
  if (!tournamentRecord.venues) tournamentRecord.venues = [];

  let venueRecord = Object.assign({}, venueTemplate(), venue);
  if (!venueRecord.venueId) venueRecord.venueId = UUID();

  const venueExists = tournamentRecord.venues.reduce((exists, venue) => {
    return exists || venue.venueId === venueRecord.venueId;
  }, undefined);

  if (!venueExists) {
    tournamentRecord.venues.push(venueRecord);
    return Object.assign({}, { venue: makeDeepCopy(venueRecord) }, SUCCESS );
  } else {
    return { error: 'Venue Exists' };
  }
}
