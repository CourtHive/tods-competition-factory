import { makeDeepCopy } from '../../../utilities/makeDeepCopy';
import { findExtension } from '../../../acquire/findExtension';
import { isObject } from '../../../utilities/objects';

import { DISABLED } from '../../../constants/extensionConstants';

export function getInContextCourt({
  convertExtensions,
  ignoreDisabled,
  venue,
  court,
}) {
  const inContextCourt = {
    ...makeDeepCopy(court, convertExtensions, true),
    venueId: venue.venueId,
  };
  const { extension } = findExtension({
    name: DISABLED,
    element: court,
  });

  if (ignoreDisabled && extension) {
    const disabledDates = isObject(extension.value)
      ? extension.value?.dates
      : undefined;

    const dateAvailability =
      extension?.value === true
        ? []
        : inContextCourt.dateAvailability
            .map((availability) => {
              const date = availability.date;
              if (!date || disabledDates.includes(date)) return; // ignore defaultAvailility (no date)
              return availability;
            })
            .filter(Boolean);

    inContextCourt.dateAvailability = dateAvailability;
  }

  return { inContextCourt };
}
