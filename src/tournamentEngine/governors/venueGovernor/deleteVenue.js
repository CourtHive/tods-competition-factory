import { getCourts } from '../../getters/courtGetter';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import { COURT, ASSIGNMENT } from '../../../constants/timeItemConstants';

export function deleteVenue({ tournamentRecord, drawEngine, venueId }) {
  if (!tournamentRecord.venues) return { error: 'No Venues' };

  const { courts } = getCourts({ tournamentRecord, venueId });
  const courtIds = courts.map(court => court.courtId);
  const contextFilters = { courtIds };
  const { matchUps: matchesToUnschedule } = allTournamentMatchUps({
    tournamentRecord,
    drawEngine,
    contextFilters,
  });

  matchesToUnschedule.forEach(matchUp => {
    if (matchUp.timeItems) {
      const hasCourtAssignment = matchUp.timeItems.reduce(
        (hasAssignment, candidate) => {
          return candidate.itemSubject === COURT ? true : hasAssignment;
        },
        undefined
      );

      if (hasCourtAssignment) {
        console.log('TODO remove court assignment', { matchUp });
        // TODO: This needs to operate on original matchUp not inContext matchUp
        // should probably call drawEngine assignMatchUp function, which means it
        // would need to find drawDefinition
        const timeItem = {
          itemSubject: COURT,
          itemType: ASSIGNMENT,
          itemValue: '',
          itemDate: '',
        };
        matchUp.timeItems.push(timeItem);
      }
    }
  });

  tournamentRecord.venues = tournamentRecord.venues.filter(
    venue => venue.venueId !== venueId
  );

  return SUCCESS;
}

export function deleteVenues({ tournamentRecord, drawEngine, venueIds }) {
  if (!tournamentRecord.venues) return { error: 'No Venues' };

  tournamentRecord.venues.forEach(venue => {
    const { venueId } = venue;
    if (venueIds.includes(venueId)) {
      const { venueId } = venue;
      deleteVenue({ tournamentRecord, drawEngine, venueId });
    }
  });

  return SUCCESS;
}
