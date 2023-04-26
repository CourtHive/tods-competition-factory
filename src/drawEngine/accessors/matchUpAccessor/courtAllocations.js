import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';
import { makeDeepCopy } from '../../../utilities';

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
    ? { allocatedCourts: makeDeepCopy(allocatedCourts, false, true) }
    : schedule;
}
