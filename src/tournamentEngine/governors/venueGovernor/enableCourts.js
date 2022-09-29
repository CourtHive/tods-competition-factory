import { removeExtension } from '../tournamentGovernor/addRemoveExtensions';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function enableCourts({ tournamentRecord, courtIds, enableAll }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(courtIds) && !enableAll) return { error: MISSING_VALUE };

  for (const venue of tournamentRecord.venues || []) {
    for (const court of venue.courts || []) {
      if (enableAll || courtIds?.includes(court.courtId))
        removeExtension({ element: court, name: DISABLED });
    }
  }

  return { ...SUCCESS };
}
