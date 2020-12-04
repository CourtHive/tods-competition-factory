import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { findCourt } from '../../getters/courtGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function deleteCourt({ tournamentRecord, drawEngine, courtId, force }) {
  const { venue } = findCourt({ tournamentRecord, courtId });

  const { matchUps } = getScheduledCourtMatchUps({
    tournamentRecord,
    drawEngine,

    courtId,
  });

  if (!matchUps.length || force) {
    venue.courts = (venue.courts || []).filter(courtRecord => {
      return courtRecord.courtId !== courtId;
    });
  } else {
    return {
      message: `Scheduled would be deleted from ${matchUps.length} matchUps; use { force: true }`,
    };
  }

  return SUCCESS;
}
