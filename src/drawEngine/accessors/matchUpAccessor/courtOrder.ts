import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { COURT_ORDER } from '../../../constants/timeItemConstants';
import { ScheduledMatchUpArgs } from './scheduledMatchUpArgs';

export function matchUpCourtOrder({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}: ScheduledMatchUpArgs) {
  const { itemValue: courtOrder, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: COURT_ORDER,
      visibilityThreshold,
    });

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { courtOrder }
    : schedule;
}
