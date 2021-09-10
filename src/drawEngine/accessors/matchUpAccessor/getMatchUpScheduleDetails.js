import { matchUpFormatTimes } from '../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { findEvent } from '../../../tournamentEngine/getters/eventGetter';
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
import { TEAM } from '../../../constants/eventConstants';

export function getMatchUpScheduleDetails({
  tournamentRecord,
  scheduleVisibilityFilters,
  afterRecoveryTimes = true,
  scheduleTiming,
  matchUpType,
  matchUp,
  event,
}) {
  if (!matchUp) return { error: MISSING_MATCHUP };

  if (
    !matchUp.matchUpType &&
    !matchUpType &&
    (event || tournamentRecord) &&
    matchUp.drawId
  ) {
    let drawDefinition = event?.drawDefinitions.find(
      (drawDefinition) => drawDefinition.drawId === matchUp.drawId
    );

    if (!drawDefinition && tournamentRecord) {
      ({ drawDefinition, event } = findEvent({
        tournamentRecord,
        drawId: matchUp.drawId,
      }));
    }

    const structure =
      matchUp.structureId &&
      drawDefinition?.structures?.find(
        ({ structureId }) => structureId === matchUp.structureId
      );

    matchUpType =
      structure?.matchUpType ||
      drawDefinition?.matchUpType ||
      (event?.eventType !== TEAM && event?.eventType);
  }

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
      typeChangeRecoveryMinutes,
      typeChangeTimeAfterRecovery;
    if (scheduleTiming && scheduledTime && afterRecoveryTimes) {
      const timingDetails = {
        matchUpFormat: matchUp.matchUpFormat,
        ...scheduleTiming,
      };
      ({
        averageMinutes = 0,
        recoveryMinutes = 0,
        typeChangeRecoveryMinutes = 0,
      } = matchUpFormatTimes({
        eventType: matchUp.matchUpType || matchUpType,
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
      if (typeChangeRecoveryMinutes) {
        typeChangeTimeAfterRecovery = endTime
          ? addMinutesToTimeString(
              extractTime(endTime),
              typeChangeRecoveryMinutes
            )
          : addMinutesToTimeString(
              scheduledTime,
              averageMinutes + typeChangeRecoveryMinutes
            );
      }
    }

    if (!scheduledDate && scheduledTime)
      scheduledDate = extractDate(scheduledTime);

    schedule = definedAttributes({
      venueId,
      courtId,
      typeChangeTimeAfterRecovery,
      timeAfterRecovery,
      scheduledDate,
      scheduledTime,

      typeChangeRecoveryMinutes,
      recoveryMinutes,
      averageMinutes,
      milliseconds,
      startTime,
      endTime,
      time,
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
