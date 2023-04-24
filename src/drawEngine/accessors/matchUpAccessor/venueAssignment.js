import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';

export function matchUpAssignedVenueId({
  matchUp,
  visibilityThreshold,
  timeStamp,
  schedule,
}) {
  const { itemValue: venueId, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: ASSIGN_VENUE,
      visibilityThreshold,
    });

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { venueId }
    : schedule;
}
