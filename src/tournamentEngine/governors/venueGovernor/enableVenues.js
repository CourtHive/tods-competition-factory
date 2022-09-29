import { removeExtension } from '../tournamentGovernor/addRemoveExtensions';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function enableVenues({ tournamentRecord, venueIds, enableAll }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(venueIds) && !enableAll) return { error: MISSING_VALUE };

  for (const venue of tournamentRecord.venues || []) {
    if (enableAll || venueIds?.includes(venue.courtId))
      removeExtension({ element: venue, name: DISABLED });
  }

  return { ...SUCCESS };
}
