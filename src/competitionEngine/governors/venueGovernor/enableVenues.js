import { enableVenues as venuesEnable } from '../../../tournamentEngine/governors/venueGovernor/enableVenues';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function enableVenues({ tournamentRecords, venueIds, enableAll }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!enableAll && !Array.isArray(venueIds)) return { error: MISSING_VALUE };

  for (const tournamentRecord of Object.keys(tournamentRecords)) {
    venuesEnable({ tournamentRecord, venueIds, enableAll });
  }

  return { ...SUCCESS };
}
