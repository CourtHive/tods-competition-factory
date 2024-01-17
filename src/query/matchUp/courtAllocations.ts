import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';
import { makeDeepCopy } from '../../tools/makeDeepCopy';

import { ALLOCATE_COURTS } from '../../constants/timeItemConstants';
import { ScheduledMatchUpArgs } from './scheduledMatchUpArgs';

export function matchUpAllocatedCourts({ visibilityThreshold, timeStamp, schedule, matchUp }: ScheduledMatchUpArgs) {
  const { itemValue: allocatedCourts, timeStamp: itemTimeStamp } = latestVisibleTimeItemValue({
    timeItems: matchUp?.timeItems || [],
    itemType: ALLOCATE_COURTS,
    visibilityThreshold,
  });

  return !schedule || (itemTimeStamp && timeStamp && new Date(itemTimeStamp).getTime() > new Date(timeStamp).getTime())
    ? { allocatedCourts: makeDeepCopy(allocatedCourts, false, true) }
    : schedule;
}
