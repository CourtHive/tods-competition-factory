import { addExtension } from '../../../mutate/extensions/addExtension';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableCourts({ tournamentRecords, courtIds, dates }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(courtIds))
    return { error: MISSING_VALUE, info: mustBeAnArray('courtIds') };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    courtsDisable({ tournamentRecord, courtIds, dates });
  }

  return { ...SUCCESS };
}

function courtsDisable({ tournamentRecord, courtIds, dates }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(courtIds))
    return {
      info: mustBeAnArray('courtIds'),
      error: MISSING_VALUE,
    };

  const disabledValue = Array.isArray(dates) && dates.length ? { dates } : true;
  const disableCourt = (court) =>
    addExtension({
      creationTime: false,
      element: court,
      extension: {
        value: disabledValue,
        name: DISABLED,
      },
    });

  for (const venue of tournamentRecord.venues || []) {
    for (const court of venue.courts || []) {
      if (courtIds?.includes(court.courtId)) {
        const result = disableCourt(court);
        if (result.error) return result;
      }
    }
  }

  return { ...SUCCESS };
}
