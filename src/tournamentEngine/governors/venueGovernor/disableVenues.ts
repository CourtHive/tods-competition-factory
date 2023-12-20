import { addExtension } from '../../../mutate/extensions/addExtension';
import { mustBeAnArray } from '../../../utilities/mustBeAnArray';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableVenues({ tournamentRecords, tournamentId, venueIds }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!Array.isArray(venueIds))
    return { error: MISSING_VALUE, info: mustBeAnArray('venueIds') };

  const tournamentIds = Object.keys(tournamentRecords).filter(
    (id) => !tournamentId || id === tournamentId
  );

  for (const tournamentId of tournamentIds) {
    const tournamentRecord = tournamentRecords[tournamentId];
    venuesDisable({ tournamentRecord, venueIds });
  }

  return { ...SUCCESS };
}

function venuesDisable({ tournamentRecord, venueIds }) {
  for (const venue of tournamentRecord.venues || []) {
    if (venueIds?.includes(venue.venueId)) {
      const result = addExtension({
        creationTime: false,
        element: venue,
        extension: {
          name: DISABLED,
          value: true,
        },
      });
      if (result.error) return result;
    }
  }

  return { ...SUCCESS };
}
