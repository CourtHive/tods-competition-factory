import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_COURT } from '../../../constants/timeItemConstants';

export function matchUpAssignedCourtId({ matchUp, visibilityThreshold }) {
  /*
  const timeItems = matchUp?.timeItems || [];
  const getTimeStamp = (item) =>
    !item.createdAt ? 0 : new Date(item.createdAt).getTime();
  const courtAssignmentItems = timeItems
    .filter((timeItem) => timeItem?.itemType === ASSIGN_COURT)
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b));

  const lastCourtAssignmentItem = courtAssignmentItems.pop();
  const courtId = lastCourtAssignmentItem && lastCourtAssignmentItem.itemValue;
  */

  const itemValue = latestVisibleTimeItemValue(
    matchUp?.timeItems || [],
    ASSIGN_COURT,
    visibilityThreshold
  );

  return { courtId: itemValue };
}
