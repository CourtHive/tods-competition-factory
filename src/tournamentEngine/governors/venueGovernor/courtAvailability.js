import { findCourt } from '../../getters/courtGetter';

import {
  MISSING_COURT_ID,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyCourtAvailability({
  tournamentRecord,
  availability,
  courtId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!courtId) return { error: MISSING_COURT_ID };

  const { court, error } = findCourt({ tournamentRecord, courtId });
  if (error) return { error };

  // TODO: determine if any scheduled matchUps would be affected and warn
  // if forced then remove schedule detail from affected matchUps

  court.dateAvailability = availability;

  return SUCCESS;
}
