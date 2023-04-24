import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { SCHEDULED_TIME } from '../../../constants/timeItemConstants';

export function scheduledMatchUpTime({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}) {
  const { itemValue: scheduledTime, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: SCHEDULED_TIME,
      visibilityThreshold,
    });

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { scheduledTime }
    : schedule;
}
