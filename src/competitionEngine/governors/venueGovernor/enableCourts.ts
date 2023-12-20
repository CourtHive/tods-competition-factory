import { removeExtension } from '../../../mutate/extensions/removeExtension';
import { addExtension } from '../../../mutate/extensions/addExtension';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';
import { findExtension } from '../../../acquire/findExtension';

import { DISABLED } from '../../../constants/extensionConstants';
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

export function courtsEnable({ tournamentRecord, courtIds, enableAll, dates }) {
  if (!Array.isArray(courtIds) && !enableAll)
    return { error: MISSING_VALUE, info: mustBeAnArray('courtIds') };

  for (const venue of tournamentRecord.venues || []) {
    for (const court of venue.courts || []) {
      if (enableAll || courtIds?.includes(court.courtId))
        if (Array.isArray(dates)) {
          const { extension } = findExtension({
            element: court,
            name: DISABLED,
          });

          if (extension) {
            const value = extension.value;
            if (Array.isArray(value.dates)) {
              value.dates = value.dates.filter((date) => !dates.includes(date));
            }
            addExtension({
              creationTime: false,
              element: court,
              extension: {
                name: DISABLED,
                value,
              },
            });
          }
        } else {
          removeExtension({ element: court, name: DISABLED });
        }
    }
  }

  return { ...SUCCESS };
}
