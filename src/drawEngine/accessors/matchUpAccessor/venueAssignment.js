import { latestVisibleTimeItemValue } from './latestVisibleTimeItemValue';

import { ASSIGN_VENUE } from '../../../constants/timeItemConstants';

export function matchUpAssignedVenueId({ matchUp, visibilityThreshold }) {
  const itemValue = latestVisibleTimeItemValue(
    matchUp?.timeItems || [],
    ASSIGN_VENUE,
    visibilityThreshold
  );

  return { venueId: itemValue };
}
