import { addNotice } from '../../../global/globalState';
import { findCourt } from '../../getters/courtGetter';

import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_VENUE } from '../../../constants/topicConstants';

export function modifyCourtAvailability({
  tournamentRecord,
  dateAvailability,
  disableNotice,
  courtId,
  force,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const { court, venue, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  if (force) {
    // TODO: determine if any scheduled matchUps would be affected and warn
    // if forced then remove schedule detail from affected matchUps
  }

  court.dateAvailability = dateAvailability;
  if (!disableNotice) addNotice({ topic: MODIFY_VENUE, payload: { venue } });

  return SUCCESS;
}
