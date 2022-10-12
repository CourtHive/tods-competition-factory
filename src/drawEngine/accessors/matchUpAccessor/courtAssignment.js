import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';

export function matchUpAssignedCourtId({
  visibilityThreshold,
  timeStamp,
  schedule,
  matchUp,
}) {
  const { itemValue: courtId, timeStamp: itemTimeStamp } =
    latestVisibleTimeItemValue(
      matchUp?.timeItems || [],
      ASSIGN_COURT,
      visibilityThreshold
    );

  return !schedule || (itemTimeStamp && timeStamp && itemTimeStamp > timeStamp)
    ? { courtId }
    : schedule;
}
