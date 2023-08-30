import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { SCHEDULED_TIME } from '../../../constants/timeItemConstants';
import { ScheduledMatchUpArgs } from './scheduledMatchUpArgs';

export function scheduledMatchUpTime({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}: ScheduledMatchUpArgs) {
  const { itemValue: scheduledTime, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: SCHEDULED_TIME,
      visibilityThreshold,
    });

  return !schedule ||
    (itemTimeStamp &&
      timeStamp &&
      new Date(itemTimeStamp).getTime() > new Date(timeStamp).getTime())
    ? { scheduledTime }
    : schedule;
}
