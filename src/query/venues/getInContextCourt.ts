import { applyVenueConstraints } from './applyVenueConstraints';
import { makeDeepCopy } from '@Tools/makeDeepCopy';
import { findExtension } from '@Acquire/findExtension';
import { isObject } from '@Tools/objects';

import { DISABLED } from '@Constants/extensionConstants';

export function getInContextCourt({ convertExtensions, ignoreDisabled, venue, court }) {
  const inContextCourt = {
    ...makeDeepCopy(court, convertExtensions, true),
    venueId: venue.venueId,
  };
  const { extension } = findExtension({
    name: DISABLED,
    element: court,
  });

  if (ignoreDisabled && extension) {
    const disabledDates = isObject(extension.value) ? extension.value?.dates : undefined;

    const dateAvailability =
      extension?.value === true
        ? []
        : inContextCourt.dateAvailability
            .map((availability) => {
              const date = availability.date;
              if (!date || disabledDates.includes(date)) return undefined; // ignore defaultAvailility (no date)
              return availability;
            })
            .filter(Boolean);

    inContextCourt.dateAvailability = dateAvailability;
  }

  applyVenueConstraints({ inContextCourt, venue });

  return { inContextCourt };
}
