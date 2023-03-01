import { matchUpFormatTimes } from '../../../tournamentEngine/governors/scheduleGovernor/matchUpFormatTiming/getMatchUpFormatTiming';
import { getVenueData } from '../../../tournamentEngine/governors/publishingGovernor/getVenueData';
import { completedMatchUpStatuses } from '../../../constants/matchUpStatusConstants';
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
  getIsoDateString,
} from '../../../utilities/dateTime';

import { MISSING_MATCHUP } from '../../../constants/errorConditionConstants';
import { TEAM } from '../../../constants/eventConstants';

export function getMatchUpScheduleDetails({
  scheduleVisibilityFilters,
  afterRecoveryTimes,
  tournamentRecord,
  scheduleTiming,
  matchUpFormat,
  matchUpType,
  matchUp,
  event,
}) {
  if (!matchUp) return { error: MISSING_MATCHUP };

  // matchUpType is required to derive averageMatchUpMinutes and recoveryMinutes.
  /// If matchUpType is not provided or is not present on matchUp...
  // ...attempt to derive by interrogating structure, draw, and event
  if (
    afterRecoveryTimes &&
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

    if (scheduleTiming?.policy && scheduledTime && afterRecoveryTimes) {
      const timingDetails = {
        matchUpFormat: matchUp.matchUpFormat || matchUpFormat,
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

    const isoDateString = getIsoDateString({ scheduledDate, scheduledTime });

    const venueData =
      (
        tournamentRecord &&
        venueId &&
        getVenueData({ tournamentRecord, venueId })
      )?.venueData || {};

    const { venueName, venueAbbreviation, courtsInfo } = venueData;

    const courtInfo =
      courtId && courtsInfo?.find((courtInfo) => courtInfo.courtId === courtId);
    const courtName = courtInfo?.courtName;

    schedule = definedAttributes({
      typeChangeTimeAfterRecovery,
      timeAfterRecovery,
      scheduledDate,
      scheduledTime,
      isoDateString,

      venueAbbreviation,
      venueName,
      venueId,
      courtName,
      courtId,

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

  const hasCompletedStatus = completedMatchUpStatuses.includes(
    matchUp.matchUpStatus
  );

  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const { scheduledTime } = scheduledMatchUpTime({ matchUp });
  const endDate =
    (hasCompletedStatus &&
      (extractDate(endTime) ||
        extractDate(scheduledDate) ||
        extractDate(scheduledTime))) ||
    undefined;

  return { schedule, endDate };
}
