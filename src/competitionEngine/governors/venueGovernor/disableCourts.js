import { disableCourts as courtsDisable } from '../../../tournamentEngine/governors/venueGovernor/disableCourts';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableCourts({ tournamentRecords, courtIds }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(courtIds)) return { error: MISSING_VALUE };

  for (const tournamentRecord of Object.keys(tournamentRecords)) {
    courtsDisable({ tournamentRecord, courtIds });
  }

  return { ...SUCCESS };
}
