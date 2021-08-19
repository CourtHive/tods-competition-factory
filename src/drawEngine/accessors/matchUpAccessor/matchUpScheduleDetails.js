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
  extractTime,
} from '../../../utilities/dateTime';

import { MISSING_MATCHUP } from '../../../constants/errorConditionConstants';

export function getMatchUpScheduleDetails({
  scheduleVisibilityFilters,
  afterRecoveryTimes = true,
  scheduleTiming,
  matchUp,
}) {
  if (!matchUp) return { error: MISSING_MATCHUP };

  const { milliseconds, time } = matchUpDuration({ matchUp });
  const { startTime } = matchUpStartTime({ matchUp });
  const { endTime } = matchUpEndTime({ matchUp });

  let schedule;
  const { visibilityThreshold, eventIds, drawIds } =
    scheduleVisibilityFilters || {};

  if (
    (!eventIds || eventIds.includes(matchUp.eventId)) &&
    (!drawIds || drawIds.includes(matchUp.drawId))
  ) {
    const scheduleSource = { matchUp, visibilityThreshold };
    let { scheduledDate } = scheduledMatchUpDate(scheduleSource);
    const { scheduledTime } = scheduledMatchUpTime(scheduleSource);
    const { courtId } = matchUpAssignedCourtId(scheduleSource);
    const { venueId } = matchUpAssignedVenueId(scheduleSource);

    let timeAfterRecovery,
      averageMinutes,
      recoveryMinutes,
      formatChangeRecoveryMinutes,
      formatChangeTimeAfterRecovery;
    if (scheduleTiming && scheduledTime && afterRecoveryTimes) {
      const timingDetails = {
        matchUpFormat: matchUp.matchUpFormat,
        ...scheduleTiming,
      };
      ({
        averageMinutes = 0,
        recoveryMinutes = 0,
        formatChangeRecoveryMinutes = 0,
      } = matchUpFormatTimes({
        eventType: matchUp.matchUpType,
        timingDetails,
      }));
      if (averageMinutes || recoveryMinutes) {
        timeAfterRecovery = endTime
          ? addMinutesToTimeString(extractTime(endTime), recoveryMinutes)
          : addMinutesToTimeString(
              scheduledTime,
              averageMinutes + recoveryMinutes
            );
      }
      if (formatChangeRecoveryMinutes) {
        formatChangeTimeAfterRecovery = endTime
          ? addMinutesToTimeString(
              extractTime(endTime),
              formatChangeRecoveryMinutes
            )
          : addMinutesToTimeString(
              scheduledTime,
              averageMinutes + formatChangeRecoveryMinutes
            );
      }
    }

    if (!scheduledDate && scheduledTime)
      scheduledDate = extractDate(scheduledTime);

    schedule = definedAttributes({
      time,
      courtId,
      venueId,
      startTime,
      endTime,
      milliseconds,
      scheduledDate,
      scheduledTime,
      averageMinutes,
      timeAfterRecovery,
      formatChangeTimeAfterRecovery,
    });
  } else {
    schedule = definedAttributes({
      time,
      startTime,
      endTime,
      milliseconds,
    });
  }

  return { schedule };
}
