import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { SCHEDULED_TIME } from '../../../constants/timeItemConstants';

export function scheduledMatchUpTime({ matchUp, visibilityThreshold }) {
  const itemValue = latestVisibleTimeItemValue(
    matchUp?.timeItems || [],
    SCHEDULED_TIME,
    visibilityThreshold
  );

  return { scheduledTime: itemValue };
}
