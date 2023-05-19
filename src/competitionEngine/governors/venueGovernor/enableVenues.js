import { enableVenues as venuesEnable } from '../../../tournamentEngine/governors/venueGovernor/enableVenues';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function enableVenues({ tournamentRecords, venueIds, enableAll }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!enableAll && !Array.isArray(venueIds))
    return { error: MISSING_VALUE, info: mustBeAnArray('venueIds') };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    venuesEnable({ tournamentRecord, venueIds, enableAll });
  }

  return { ...SUCCESS };
}
