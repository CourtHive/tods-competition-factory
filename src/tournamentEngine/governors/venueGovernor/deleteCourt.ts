import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { removeCourtAssignment } from './removeCourtAssignment';
import { addNotice } from '../../../global/state/globalState';
import { findCourt } from '../../getters/courtGetter';
import { deletionMessage } from './deletionMessage';

import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';
import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { Tournament } from '../../../types/tournamentTypes';
import { SUCCESS } from '../../../constants/resultConstants';

type DeleteCourtArgs = {
  tournamentRecord: Tournament;
  disableNotice?: boolean;
  courtId: string;
  force?: boolean;
};
export function deleteCourt({
  tournamentRecord,
  disableNotice,
  courtId,
  force,
}: DeleteCourtArgs) {
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
