import { matchUpEndTime } from './endTime';
import { matchUpStartTime } from './startTime';
import { matchUpDuration } from './matchUpDuration';
import { scheduledMatchUpTime } from './scheduledMatchUpTime';
import { scheduledMatchUpDate } from './scheduledMatchUpDate';
import { matchUpAssignedCourtId } from './courtAssignment';
import { matchUpAssignedVenueId } from './venueAssignment';
import { extractDate } from '../../../utilities/dateTime';

export function getMatchUpScheduleDetails({ matchUp }) {
  const { milliseconds, time } = matchUpDuration({ matchUp });
  let { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const { scheduledTime } = scheduledMatchUpTime({ matchUp });
  const { startTime } = matchUpStartTime({ matchUp });
  const { endTime } = matchUpEndTime({ matchUp });
  const { courtId } = matchUpAssignedCourtId({ matchUp });
  const { venueId } = matchUpAssignedVenueId({ matchUp });

  if (!scheduledDate && scheduledTime)
    scheduledDate = extractDate(scheduledTime);

  const schedule = {
    time,
    courtId,
    venueId,
    startTime,
    endTime,
    milliseconds,
    scheduledDate,
    scheduledTime,
  };

  return { schedule };
}
