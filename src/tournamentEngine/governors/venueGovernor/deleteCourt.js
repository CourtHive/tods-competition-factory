import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { findCourt } from '../../getters/courtGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import { deletionMessage } from './deletionMessage';
import { removeCourtAssignment } from './removeCourtAssignment';

// TODO: drawDefinition should not be required. Although this method may primarily be called from competitionEngine.
// getScheduledCourtMatchUps should get matchUPs inContext so that drawIds can be determined.
export function deleteCourt({
  tournamentRecord,
  drawDefinition,
  courtId,
  force,
}) {
  const { venue, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  const { matchUps } = getScheduledCourtMatchUps({
    tournamentRecord,

    courtId,
  });

  if (!matchUps.length || force) {
    matchUps.forEach((matchUp) => {
      removeCourtAssignment({
        tournamentRecord,
        drawDefinition,
        matchUpId: matchUp.matchUpId,
      });
    });
    venue.courts = (venue.courts || []).filter((courtRecord) => {
      return courtRecord.courtId !== courtId;
    });
  } else {
    return deletionMessage({ matchUpsCount: matchUps.length });
  }

  return SUCCESS;
}
