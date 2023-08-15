import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { SCHEDULED_DATE } from '../../../constants/timeItemConstants';
import { ScheduledMatchUpArgs } from './scheduledMatchUpArgs';

export function scheduledMatchUpDate({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}: ScheduledMatchUpArgs) {
  const { itemValue: scheduledDate, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: SCHEDULED_DATE,
      visibilityThreshold,
    });

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { scheduledDate }
    : schedule;
}
