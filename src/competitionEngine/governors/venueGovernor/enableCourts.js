import { enableCourts as courtsEnable } from '../../../tournamentEngine/governors/venueGovernor/enableCourts';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function enableCourts({
  tournamentRecords,
  enableAll,
  courtIds,
  dates,
}) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!enableAll && !Array.isArray(courtIds))
    return { error: MISSING_VALUE, info: mustBeAnArray('courtIds') };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    courtsEnable({ tournamentRecord, courtIds, enableAll, dates });
  }

  return { ...SUCCESS };
}
