import { addExtension } from '../../../global/functions/producers/addExtension';

import { DISABLED } from '../../../constants/extensionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function disableVenues({ tournamentRecord, venueIds }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!Array.isArray(venueIds)) return { error: MISSING_VALUE };

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
