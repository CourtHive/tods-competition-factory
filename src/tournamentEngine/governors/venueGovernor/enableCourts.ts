import { findExtension } from '../../../global/functions/deducers/findExtension';
import { addExtension } from '../../../global/functions/producers/addExtension';
import { removeExtension } from '../tournamentGovernor/addRemoveExtensions';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function enableCourts({ tournamentRecord, courtIds, enableAll, dates }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
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
