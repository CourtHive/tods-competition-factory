import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ALLOCATE_COURTS } from '../../../constants/timeItemConstants';

export function matchUpAllocatedCourts({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}) {
  const { itemValue: allocatedCourts, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: ALLOCATE_COURTS,
      visibilityThreshold,
    });

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { allocatedCourts }
    : schedule;
}
