import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';
import { ScheduledMatchUpArgs } from './scheduledMatchUpArgs';

export function matchUpAssignedCourtId({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}: ScheduledMatchUpArgs) {
  const { itemValue: courtId, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue({
      timeItems: matchUp?.timeItems || [],
      itemType: ASSIGN_COURT,
      visibilityThreshold,
    });

  return !schedule ||
    (itemTimeStamp &&
      timeStamp &&
      new Date(itemTimeStamp).getTime() > new Date(timeStamp).getTime())
    ? { courtId }
    : schedule;
}
