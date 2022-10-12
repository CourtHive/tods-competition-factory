import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { SCHEDULED_DATE } from '../../../constants/timeItemConstants';

export function scheduledMatchUpDate({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}) {
  const { itemValue: scheduledDate, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue(
      matchUp?.timeItems || [],
      SCHEDULED_DATE,
      visibilityThreshold
    );

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { scheduledDate }
    : schedule;
}
