import { getLinkedTournamentIds } from '../../competitionEngine/governors/competitionsGovernor/tournamentLinks';
import { addVenue } from '../governors/venueGovernor/addVenue';
import { makeDeepCopy } from '../../utilities';

import { SUCCESS } from '../../constants/resultConstants';
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

export function findVenue({ tournamentRecords, tournamentRecord, venueId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!venueId) return { error: MISSING_VENUE_ID };
  const venues = tournamentRecord.venues || [];
  let venue = venues.reduce((venue, venueRecord) => {
    return venueRecord.venueId === venueId ? venueRecord : venue;
  }, undefined);

  if (!venue && tournamentRecords) {
    const linkedTournamentIds = getLinkedTournamentIds({
      tournamentRecords,
    }).linkedTournamentIds;

    const relevantIds = linkedTournamentIds[tournamentRecord.tournamentId];

    // if there are linked tournaments search for court in all linked tournaments
    for (const tournamentId of relevantIds) {
      const record = tournamentRecords[tournamentId];
      const result = findVenue({ tournamentRecord: record, venueId });
      // if venue is found in linked tournamentRecords, add venue to original tournamentRecord
      if (result.success) {
        addVenue({ tournamentRecord, venue: result.venue });
        return { ...SUCCESS, venue };
      }
    }
  }

  if (!venue) {
    return { error: VENUE_NOT_FOUND };
  } else {
    return { ...SUCCESS, venue };
  }
}

export function publicFindVenue(params) {
  return makeDeepCopy(findVenue(params), false, true);
}
