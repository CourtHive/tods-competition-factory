import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';

export function matchUpAssignedVenueId({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}: import('./scheduledMatchUpArgs').ScheduledMatchUpArgs) {
  const { itemValue: venueId, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: ASSIGN_VENUE,
      visibilityThreshold,
    });

  return !schedule ||
    (itemTimeStamp &&
      timeStamp &&
      new Date(itemTimeStamp).getTime() > new Date(timeStamp).getTime())
    ? { venueId }
    : schedule;
}
