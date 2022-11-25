import { addExtension } from '../../../global/functions/producers/addExtension';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableCourts({ tournamentRecord, courtIds, dates }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(courtIds)) return { error: MISSING_VALUE };

  const disabledValue = Array.isArray(dates) && dates.length ? { dates } : true;

  for (const venue of tournamentRecord.venues || []) {
    for (const court of venue.courts || []) {
      if (courtIds?.includes(court.courtId)) {
        const result = addExtension({
          creationTime: false,
          element: court,
          extension: {
            value: disabledValue,
            name: DISABLED,
          },
        });
        if (result.error) return result;
      }
    }
  }

  return { ...SUCCESS };
}
