import { allTournamentMatchUps } from '../../getters/matchUpsGetter/matchUpsGetter';
import { removeCourtAssignment } from './removeCourtAssignment';
import { addNotice } from '../../../global/state/globalState';
import { deletionMessage } from './deletionMessage';

import { DELETE_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
  VENUE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function deleteVenue({ tournamentRecord, venueId, force }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof venueId !== 'string') return { error: MISSING_VENUE_ID };

  const contextFilters = { venueIds: [venueId] };
  const { matchUps: matchUpsToUnschedule } = allTournamentMatchUps({
    tournamentRecord,
    contextFilters,
  });

  if (!matchUpsToUnschedule.length || force) {
    // if no matchUpsToUnschedule this does nothing but avoid the deletionMessage
    for (const matchUp of matchUpsToUnschedule) {
      const result = removeCourtAssignment({
        matchUpId: matchUp.matchUpId,
        drawId: matchUp.drawId,
        tournamentRecord,
      });
      if (result.error) return result;
    }
  } else {
    return deletionMessage({ matchUpsCount: matchUpsToUnschedule.length });
  }

  let deleted;
  tournamentRecord.venues = (tournamentRecord.venues || []).filter((venue) => {
    if (venue.venueId !== venueId) return true;
    deleted = true;
  });

  if (!deleted) return { error: VENUE_NOT_FOUND };

  addNotice({
    payload: { venueId, tournamentId: tournamentRecord.tournamentId },
    topic: DELETE_VENUE,
    key: venueId,
  });

  return { ...SUCCESS };
}

export function deleteVenues({ tournamentRecord, venueIds, force }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(venueIds)) return { error: INVALID_VALUES };

  for (const venue of tournamentRecord.venues || []) {
    const { venueId } = venue;
    if (venueIds.includes(venueId)) {
      const { venueId } = venue;
      const result = deleteVenue({ tournamentRecord, venueId, force });
      if (result.error) return result;
    }
  }

  return { ...SUCCESS };
}
