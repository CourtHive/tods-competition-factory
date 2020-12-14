import { assignMatchUpVenue as assignVenue } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';

export function assignMatchUpVenue({
  drawDefinition,
  matchUpId,
  venueId,
  venueDayDate,
}) {
  return assignVenue({
    drawDefinition,
    matchUpId,
    venueId,
    venueDayDate,
  });
}
