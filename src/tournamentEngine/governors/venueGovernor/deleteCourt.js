import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { removeCourtAssignment } from './removeCourtAssignment';
import { addNotice } from '../../../global/globalState';
import { findCourt } from '../../getters/courtGetter';
import { deletionMessage } from './deletionMessage';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function deleteCourt({
  tournamentRecord,
  drawDefinition,
  disableNotice,
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
    for (const matchUp of matchUps) {
      const result = removeCourtAssignment({
        tournamentRecord,
        drawDefinition,
        drawId: matchUp.drawId,
        matchUpId: matchUp.matchUpId,
      });
      if (result.error) return result;
    }
    venue.courts = (venue.courts || []).filter((courtRecord) => {
      return courtRecord.courtId !== courtId;
    });
    if (!disableNotice)
      addNotice({
        topic: MODIFY_VENUE,
        payload: { venue },
        key: venue.venueId,
      });
  } else {
    return deletionMessage({ matchUpsCount: matchUps.length });
  }

  return { ...SUCCESS };
}
