import { disableVenues as venuesDisable } from '../../../tournamentEngine/governors/venueGovernor/disableVenues';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableVenues({ tournamentRecords, venueIds }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(venueIds))
    return { error: MISSING_VALUE, info: 'venueIds must be an array' };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    venuesDisable({ tournamentRecord, venueIds });
  }

  return { ...SUCCESS };
}
