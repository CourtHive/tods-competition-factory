import { removeCourtAssignment } from '../matchUps/schedule/removeCourtAssignment';
import { getScheduledCourtMatchUps } from '../../query/venues/getScheduledCourtMatchUps';
import { deletionMessage } from '../../assemblies/generators/matchUps/deletionMessage';
import { resolveTournamentRecords } from '../../parameters/resolveTournamentRecords';
import { checkRequiredParameters } from '../../parameters/checkRequiredParameters';
import { getAppliedPolicies } from '../../query/extensions/getAppliedPolicies';
import { addNotice } from '../../global/state/globalState';
import { findCourt } from './findCourt';

import { COURT_NOT_FOUND } from '../../constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '../../constants/policyConstants';
import { MODIFY_VENUE } from '../../constants/topicConstants';
import { TournamentRecords } from '../../types/factoryTypes';
import { SUCCESS } from '../../constants/resultConstants';
import { Tournament } from '../../types/tournamentTypes';
import { COURT_ID, TOURNAMENT_RECORDS } from '../../constants/attributeConstants';

type DeleteCourtArgs = {
  tournamentRecords?: TournamentRecords;
  tournamentRecord?: Tournament;
  disableNotice?: boolean;
  courtId: string;
  force?: boolean;
};
export function deleteCourt(params: DeleteCourtArgs) {
  const { courtId, disableNotice, force } = params;
  const tournamentRecords = resolveTournamentRecords(params);
  const paramsCheck = checkRequiredParameters(params, [{ [TOURNAMENT_RECORDS]: true, [COURT_ID]: true }]);
  if (paramsCheck.error) return paramsCheck;

  let courtDeleted;
  let result;

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    result = courtDeletion({ tournamentRecord, disableNotice, courtId, force });
    if (result.error && result.error !== COURT_NOT_FOUND) return result;
    if (result.success) courtDeleted = true;
  }

  return courtDeleted ? { ...SUCCESS } : result;
}

export function courtDeletion({ tournamentRecord, disableNotice, courtId, force }) {
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
    force ?? appliedPolicies?.[POLICY_TYPE_SCHEDULING]?.allowDeletionWithScoresPresent?.courts;

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
          payload: { venue, tournamentId: tournamentRecord.tournamentId },
          topic: MODIFY_VENUE,
          key: venue.venueId,
        });
    }
  } else {
    return deletionMessage({ matchUpsCount: matchUps.length });
  }

  return { ...SUCCESS };
}
