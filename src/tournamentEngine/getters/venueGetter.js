import { makeDeepCopy } from '../../utilities';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../constants/errorConditionConstants';

export function getVenuesAndCourts({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const venues = makeDeepCopy(tournamentRecord.venues || []);
  const courts = venues.reduce((courts, venue) => {
    return venue?.courts?.length ? courts.concat(venue.courts) : courts;
  }, []);
  return { venues, courts };
}

export function findVenue({ tournamentRecord, venueId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };
  const venues = tournamentRecord.venues || [];
  const venue = venues.reduce((venue, venueRecord) => {
    return venueRecord.venueId === venueId ? venueRecord : venue;
  }, undefined);

  return (venue && { venue }) || { error: VENUE_NOT_FOUND };
}

export function publicFindVenue(params) {
  return makeDeepCopy(findVenue(params), false, true);
}
