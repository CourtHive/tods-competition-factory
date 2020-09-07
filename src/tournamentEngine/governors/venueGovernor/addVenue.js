import { UUID, makeDeepCopy } from 'competitionFactory/utilities';
import { SUCCESS } from 'competitionFactory/constants/resultConstants';
import { venueTemplate } from 'competitionFactory/tournamentEngine/generators/venueTemplate';

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
