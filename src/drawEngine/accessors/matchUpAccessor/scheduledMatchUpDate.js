import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { SCHEDULED_DATE } from '../../../constants/timeItemConstants';

export function scheduledMatchUpDate({ matchUp, visibilityThreshold }) {
  const itemValue = latestVisibleTimeItemValue(
    matchUp?.timeItems || [],
    SCHEDULED_DATE,
    visibilityThreshold
  );

  return { scheduledDate: itemValue };
}
