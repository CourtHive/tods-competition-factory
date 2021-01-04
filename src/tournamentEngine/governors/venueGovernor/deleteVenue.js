import { getCourts } from '../../getters/courtGetter';
import { allTournamentMatchUps } from '../../getters/matchUpsGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import { VENUE_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { deletionMessage } from './deletionMessage';
import { removeCourtAssignment } from './removeCourtAssignment';

export function deleteVenue({
  tournamentRecord,
  drawDefinition,
  venueId,
  force,
}) {
  if (!tournamentRecord.venues) return { error: VENUE_NOT_FOUND };

  const { courts } = getCourts({ tournamentRecord, venueId });
  const courtIds = courts.map((court) => court.courtId);
  const contextFilters = { courtIds };
  const { matchUps: matchUpsToUnschedule } = allTournamentMatchUps({
    tournamentRecord,
    contextFilters,
  });

  if (!matchUpsToUnschedule.length || force) {
    matchUpsToUnschedule.forEach((matchUp) => {
      removeCourtAssignment({
        tournamentRecord,
        drawDefinition,
        matchUpId: matchUp.matchUpId,
      });
    });
  } else {
    return deletionMessage({ matchUpsCount: matchUpsToUnschedule.length });
  }

  tournamentRecord.venues = tournamentRecord.venues.filter(
    (venue) => venue.venueId !== venueId
  );

  return SUCCESS;
}

export function deleteVenues({ tournamentRecord, venueIds }) {
  if (!tournamentRecord.venues) return { error: VENUE_NOT_FOUND };

  tournamentRecord.venues.forEach((venue) => {
    const { venueId } = venue;
    if (venueIds.includes(venueId)) {
      const { venueId } = venue;
      deleteVenue({ tournamentRecord, venueId });
    }
  });

  return SUCCESS;
}
