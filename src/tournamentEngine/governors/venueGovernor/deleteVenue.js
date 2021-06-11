import { allTournamentMatchUps } from '../../getters/matchUpsGetter';
import { removeCourtAssignment } from './removeCourtAssignment';
import { addNotice } from '../../../global/globalState';
import { getCourts } from '../../getters/courtGetter';
import { deletionMessage } from './deletionMessage';

import { SUCCESS } from '../../../constants/resultConstants';
import { VENUE_NOT_FOUND } from '../../../constants/errorConditionConstants';
import { DELETE_VENUE } from '../../../constants/topicConstants';

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

  let deleted;
  tournamentRecord.venues = tournamentRecord.venues.filter((venue) => {
    if (venue.venueId !== venueId) return true;
    deleted = true;
  });

  if (deleted) addNotice({ topic: DELETE_VENUE, payload: { venueId } });

  return SUCCESS;
}

export function deleteVenues({ tournamentRecord, venueIds, force }) {
  if (!tournamentRecord.venues) return { error: VENUE_NOT_FOUND };

  tournamentRecord.venues.forEach((venue) => {
    const { venueId } = venue;
    if (venueIds.includes(venueId)) {
      const { venueId } = venue;
      deleteVenue({ tournamentRecord, venueId, force });
    }
  });

  return SUCCESS;
}
