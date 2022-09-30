import { addExtension } from '../../../global/functions/producers/addExtension';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableCourts({ tournamentRecord, courtIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(courtIds)) return { error: MISSING_VALUE };

  for (const venue of tournamentRecord.venues || []) {
    for (const court of venue.courts || []) {
      if (courtIds?.includes(court.courtId)) {
        const result = addExtension({
          creationTime: false,
          element: court,
          extension: {
            name: DISABLED,
            value: true,
          },
        });
        if (result.error) return result;
      }
    }
  }

  return { ...SUCCESS };
}
