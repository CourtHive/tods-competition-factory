import { getScheduledCourtMatchUps } from '../queryGovernor/getScheduledCourtMatchUps';
import { validDateAvailability } from './dateAvailability';
import { addNotice } from '../../../global/state/globalState';
import { findCourt } from '../../getters/courtGetter';

import { MODIFY_VENUE } from '../../../constants/topicConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';

export function modifyCourtAvailability({
  tournamentRecord,
  dateAvailability,
  disableNotice,
  venueMatchUps,
  courtId,
  force,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const result = validDateAvailability({ dateAvailability });
  if (result.error) return result;

  const { court, venue, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  const { matchUps: courtMatchUps } = getScheduledCourtMatchUps({
    tournamentRecord,
    venueMatchUps,
    courtId,
  });

  // check whether there are matchUps which are no longer possible to play
  // this will only apply to Pro Scheduling
  if (courtMatchUps?.length) {
    console.log('scheduled court matchUps', courtMatchUps.length);
    if (force) {
      // go ahead and remove scheduling
    }
  }

  court.dateAvailability = dateAvailability;
  if (!disableNotice)
    addNotice({
      payload: { venue, tournamentId: tournamentRecord.tournamentId },
      topic: MODIFY_VENUE,
      key: venue.venueId,
    });

  return { ...SUCCESS };
}
