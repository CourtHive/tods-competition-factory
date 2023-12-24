import { removeCourtAssignment } from '../matchUps/schedule/removeCourtAssignment';
import { getScheduledCourtMatchUps } from '../../query/venues/getScheduledCourtMatchUps';
import { deletionMessage } from '../../assemblies/generators/matchUps/deletionMessage';
import { resolveTournamentRecords } from '../../parameters/resolveTournamentRecords';
import { getAppliedPolicies } from '../../query/extensions/getAppliedPolicies';
import { addNotice } from '../../global/state/globalState';
import { findCourt } from './findCourt';

import { POLICY_TYPE_SCHEDULING } from '../../constants/policyConstants';
import { MODIFY_VENUE } from '../../constants/topicConstants';
import { TournamentRecords } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import { Tournament } from '../../types/tournamentTypes';
import {
  COURT_NOT_FOUND,
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../constants/errorConditionConstants';

type DeleteCourtArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  disableNotice?: boolean;
  courtId: string;
  force?: boolean;
};
export function deleteCourt(params: DeleteCourtArgs) {
  const { courtId, force } = params;
  const tournamentRecords = resolveTournamentRecords(params);
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof courtId !== 'string') return { error: MISSING_COURT_ID };

  let courtDeleted;
  let result;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    result = courtDeletion({ tournamentRecord, courtId, force });
    if (result.error && result.error !== COURT_NOT_FOUND) return result;
    if (result.success) courtDeleted = true;
  }

  return courtDeleted ? { ...SUCCESS } : result;
}

export function courtDeletion({
  tournamentRecord,
  disableNotice,
  courtId,
  force,
}: DeleteCourtArgs) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const result = findCourt({ tournamentRecord, courtId });
  if (result.error) return result;
  const venue = result.venue;

  const { matchUps } = getScheduledCourtMatchUps({
    tournamentRecord,
    courtId,
  });

  const appliedPolicies = getAppliedPolicies({
    tournamentRecord,
  })?.appliedPolicies;

  const allowModificationWhenMatchUpsScheduled =
    force ??
    appliedPolicies?.[POLICY_TYPE_SCHEDULING]?.allowDeletionWithScoresPresent
      ?.courts;

  if (!matchUps?.length || allowModificationWhenMatchUpsScheduled) {
    for (const matchUp of matchUps ?? []) {
      const result = removeCourtAssignment({
        matchUpId: matchUp.matchUpId,
        drawId: matchUp.drawId,
        tournamentRecord,
      });
      if (result.error) return result;
    }

    if (venue) {
      venue.courts = (venue.courts ?? []).filter((courtRecord) => {
        return courtRecord.courtId !== courtId;
      });
      if (!disableNotice)
        addNotice({
          topic: MODIFY_VENUE,
          payload: { venue, tournamentId: tournamentRecord.tournamentId },
          key: venue.venueId,
        });
    }
  } else {
    return deletionMessage({ matchUpsCount: matchUps.length });
  }

  return { ...SUCCESS };
}
