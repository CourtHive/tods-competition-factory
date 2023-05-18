import { disableVenues as venuesDisable } from '../../../tournamentEngine/governors/venueGovernor/disableVenues';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableVenues({ tournamentRecords, venueIds }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(venueIds))
    return { error: MISSING_VALUE, info: mustBeAnArray('venueIds') };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    venuesDisable({ tournamentRecord, venueIds });
  }

  return { ...SUCCESS };
}
