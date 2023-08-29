import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { removeCourtAssignment } from './removeCourtAssignment';
import { addNotice } from '../../../global/state/globalState';
import { findCourt } from '../../getters/courtGetter';
import { deletionMessage } from './deletionMessage';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DrawDefinition,
  Tournament,
} from '../../../types/tournamentFromSchema';

type DeleteCourtArgs = {
  drawDefinition?: DrawDefinition;
  tournamentRecord: Tournament;
  disableNotice?: boolean;
  courtId: string;
  force?: boolean;
};
export function deleteCourt({
  tournamentRecord,
  drawDefinition,
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

  if (!matchUps?.length || force) {
    for (const matchUp of matchUps || []) {
      const result = removeCourtAssignment({
        matchUpId: matchUp.matchUpId,
        drawId: matchUp.drawId,
        tournamentRecord,
        drawDefinition,
      });
      if (result.error) return result;
    }

    if (venue) {
      venue.courts = (venue.courts || []).filter((courtRecord) => {
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
