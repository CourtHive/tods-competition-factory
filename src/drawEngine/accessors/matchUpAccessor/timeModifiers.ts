import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { TIME_MODIFIERS } from '../../../constants/timeItemConstants';
import { ScheduledMatchUpArgs } from './scheduledMatchUpArgs';

export function matchUpTimeModifiers({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}: ScheduledMatchUpArgs) {
  const { itemValue: timeModifiers, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: TIME_MODIFIERS,
      visibilityThreshold,
    });

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { timeModifiers }
    : schedule;
}
