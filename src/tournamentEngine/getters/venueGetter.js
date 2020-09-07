import { makeDeepCopy } from 'src/utilities';

export function getVenues({tournamentRecord}) {
  const venues = tournamentRecord.venues || [];
  return { venues: makeDeepCopy(venues) };
}

export function findVenue({tournamentRecord, venueId}) {
  const venues = tournamentRecord.venues || [];
  const venue = venues.reduce((venue, venueRecord) => {
    return venueRecord.venueId === venueId ? venueRecord : venue;
  }, undefined);

  return (venue && { venue }) || { error: 'Venue Not Found' };
}

export function publicFindVenue(props) { return makeDeepCopy(findVenue(props)); }
