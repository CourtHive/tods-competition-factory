import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';

export function matchUpAssignedCourtId({ matchUp, visibilityThreshold }) {
  const itemValue = latestVisibleTimeItemValue(
    matchUp?.timeItems || [],
    ASSIGN_COURT,
    visibilityThreshold
  );

  return { courtId: itemValue };
}
