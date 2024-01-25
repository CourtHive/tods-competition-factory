import { allCompetitionMatchUps } from '../../query/matchUps/getAllCompetitionMatchUps';
import { deletionMessage } from '../../assemblies/generators/matchUps/deletionMessage';
import { removeCourtAssignment } from '../matchUps/schedule/removeCourtAssignment';
import { checkAndUpdateSchedulingProfile } from '../tournaments/schedulingProfile';
import { getAppliedPolicies } from '../../query/extensions/getAppliedPolicies';
import { addNotice } from '../../global/state/globalState';

import { POLICY_TYPE_SCHEDULING } from '../../constants/policyConstants';
import { Tournament, Venue } from '../../types/tournamentTypes';
import { DELETE_VENUE } from '../../constants/topicConstants';
import { TournamentRecords } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import {
  ErrorType,
  INVALID_VALUES,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VENUE_ID,
} from '../../constants/errorConditionConstants';

type DeleteVenueArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  venueId: string;
  force?: boolean;
};

export function deleteVenue(params: DeleteVenueArgs): {
  success?: boolean;
  error?: ErrorType;
} {
  if (typeof params?.venueId !== 'string') return { error: MISSING_VENUE_ID };

  const { tournamentRecord, venueId, force } = params;

  const tournamentRecords =
    params.tournamentRecords ||
    (tournamentRecord && {
      [tournamentRecord.tournamentId]: tournamentRecord,
    }) ||
    {};

  if (!Object.keys(tournamentRecords).length) return { error: MISSING_TOURNAMENT_RECORD };

  const contextFilters = { venueIds: [venueId] };
  const matchUpsToUnschedule =
    allCompetitionMatchUps({
      tournamentRecords,
      contextFilters,
    }).matchUps ?? [];

  const appliedPolicies = getAppliedPolicies({
    tournamentRecord,
  })?.appliedPolicies;

  const allowModificationWhenMatchUpsScheduled =
    force ?? appliedPolicies?.[POLICY_TYPE_SCHEDULING]?.allowDeletionWithScoresPresent?.venues;

  if (!matchUpsToUnschedule.length || allowModificationWhenMatchUpsScheduled) {
    for (const tournamentRecord of Object.values(tournamentRecords)) {
      // if no matchUpsToUnschedule this does nothing but avoid the deletionMessage
      for (const matchUp of matchUpsToUnschedule) {
        const result = removeCourtAssignment({
          matchUpId: matchUp.matchUpId,
          drawId: matchUp.drawId,
          tournamentRecord,
        });
        if (result.error) return result;
      }
      let deleted;
      tournamentRecord.venues = (tournamentRecord.venues ?? []).filter((venue: Venue | undefined) => {
        if (venue?.venueId !== venueId) return true;
        deleted = true;
        return false;
      });
      if (deleted) {
        addNotice({
          payload: { venueId, tournamentId: tournamentRecord.tournamentId },
          topic: DELETE_VENUE,
          key: venueId,
        });
      }
    }
  } else {
    return deletionMessage({ matchUpsCount: matchUpsToUnschedule.length });
  }

  checkAndUpdateSchedulingProfile({ tournamentRecords });

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
