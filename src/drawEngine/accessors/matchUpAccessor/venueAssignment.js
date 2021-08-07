import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';

export function matchUpAssignedVenueId({ matchUp, visibilityThreshold }) {
  /*
  const timeItems = matchUp?.timeItems || [];
  const getTimeStamp = (item) =>
    !item.createdAt ? 0 : new Date(item.createdAt).getTime();
  const lastCourtAssignmentItem = timeItems
    .filter((timeItem) => timeItem?.itemType === ASSIGN_VENUE)
    .sort((a, b) => getTimeStamp(a) - getTimeStamp(b))
    .pop();

  const venueId = lastCourtAssignmentItem && lastCourtAssignmentItem.itemValue;
  */

  const itemValue = latestVisibleTimeItemValue(
    matchUp?.timeItems || [],
    ASSIGN_VENUE,
    visibilityThreshold
  );

  return { venueId: itemValue };
}
