import { matchUpFormatTimes } from '../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { definedAttributes } from '../../../utilities/objects';
import { scheduledMatchUpTime } from './scheduledMatchUpTime';
import { scheduledMatchUpDate } from './scheduledMatchUpDate';
import { matchUpAssignedCourtId } from './courtAssignment';
import { matchUpAssignedVenueId } from './venueAssignment';
import { matchUpDuration } from './matchUpDuration';
import { matchUpStartTime } from './startTime';
import { matchUpEndTime } from './endTime';
import {
  addMinutesToTimeString,
  extractDate,
} from '../../../utilities/dateTime';

import { MISSING_MATCHUP } from '../../../constants/errorConditionConstants';

export function getMatchUpScheduleDetails({
  scheduleVisibilityFilters,
  afterRecoveryTimes = true,
  scheduleTiming,
  matchUp,
}) {
  if (!matchUp) return { error: MISSING_MATCHUP };
  if (scheduleVisibilityFilters) {
    console.log({ scheduleVisibilityFilters });
  }

  const { milliseconds, time } = matchUpDuration({ matchUp });
  let { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const { scheduledTime } = scheduledMatchUpTime({ matchUp });
  const { startTime } = matchUpStartTime({ matchUp });
  const { endTime } = matchUpEndTime({ matchUp });
  const { courtId } = matchUpAssignedCourtId({ matchUp });
  const { venueId } = matchUpAssignedVenueId({ matchUp });

  let afterRecoveryTime;
  if (scheduleTiming && scheduledTime && afterRecoveryTimes) {
    const timingDetails = {
      matchUpFormat: matchUp.matchUpFormat,
      ...scheduleTiming,
    };
    const { averageMinutes = 0, recoveryMinutes = 0 } = matchUpFormatTimes({
      eventType: matchUp.matchUpType,
      timingDetails,
    });
    if (averageMinutes || recoveryMinutes) {
      afterRecoveryTime = addMinutesToTimeString(
        scheduledTime,
        averageMinutes + recoveryMinutes
      );
    }
  }

  if (!scheduledDate && scheduledTime)
    scheduledDate = extractDate(scheduledTime);

  const schedule = definedAttributes({
    time,
    courtId,
    venueId,
    startTime,
    endTime,
    milliseconds,
    scheduledDate,
    scheduledTime,
    afterRecoveryTime,
  });

  return { schedule };
}
