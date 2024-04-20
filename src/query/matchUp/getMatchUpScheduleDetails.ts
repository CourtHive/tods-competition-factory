import { addMinutesToTimeString, extractDate, extractTime, getIsoDateString } from '@Tools/dateTime';
import { matchUpFormatTimes } from '@Query/extensions/matchUpFormatTiming/getMatchUpFormatTiming';
import { completedMatchUpStatuses } from '@Constants/matchUpStatusConstants';
import { scheduledMatchUpTime } from '@Query/matchUp/scheduledMatchUpTime';
import { scheduledMatchUpDate } from '@Query/matchUp/scheduledMatchUpDate';
import { matchUpAllocatedCourts } from '@Query/matchUp/courtAllocations';
import { matchUpAssignedCourtId } from '@Query/matchUp/courtAssignment';
import { matchUpAssignedVenueId } from '@Query/matchUp/venueAssignment';
import { matchUpTimeModifiers } from '@Query/matchUp/timeModifiers';
import { matchUpDuration } from '@Query/matchUp/matchUpDuration';
import { matchUpCourtOrder } from '@Query/matchUp/courtOrder';
import { getHomeParticipantId } from './getHomeParticipantId';
import { matchUpStartTime } from '@Query/matchUp/startTime';
import { definedAttributes } from '@Tools/definedAttributes';
import { getVenueData } from '@Query/venues/getVenueData';
import { attributeFilter } from '@Tools/attributeFilter';
import { matchUpEndTime } from '@Query/matchUp/endTime';
import { findEvent } from '@Acquire/findEvent';

// constants and types
import { Event, Tournament, EventTypeUnion, DrawDefinition } from '@Types/tournamentTypes';
import { ScheduleTiming, ScheduleVisibilityFilters } from '@Types/factoryTypes';
import { MISSING_MATCHUP } from '@Constants/errorConditionConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import { TEAM } from '@Constants/eventConstants';

type GetMatchUpScheduleDetailsArgs = {
  scheduleVisibilityFilters?: ScheduleVisibilityFilters;
  scheduleTiming?: ScheduleTiming;
  tournamentRecord?: Tournament;
  drawDefinition?: DrawDefinition;
  matchUpType?: EventTypeUnion;
  afterRecoveryTimes?: boolean;
  usePublishState?: boolean;
  matchUp: HydratedMatchUp;
  matchUpFormat?: string;
  publishStatus?: any;
  event?: Event;
};
export function getMatchUpScheduleDetails(params: GetMatchUpScheduleDetailsArgs) {
  let event = params.event;
  let matchUpType: any = params.matchUpType;
  const {
    scheduleVisibilityFilters,
    afterRecoveryTimes,
    tournamentRecord,
    usePublishState,
    scheduleTiming,
    matchUpFormat,
    publishStatus,
    matchUp,
  } = params;

  if (!matchUp) return { error: MISSING_MATCHUP };

  // matchUpType is required to derive averageMatchUpMinutes and recoveryMinutes.
  /// If matchUpType is not provided or is not present on matchUp...
  // ...attempt to derive by interrogating structure, draw, and event
  if (
    afterRecoveryTimes &&
    !matchUp.matchUpType &&
    !params.matchUpType &&
    (event || tournamentRecord) &&
    matchUp.drawId
  ) {
    let drawDefinition =
      params.drawDefinition ||
      event?.drawDefinitions?.find((drawDefinition) => drawDefinition.drawId === matchUp.drawId);

    if (!drawDefinition && tournamentRecord) {
      ({ drawDefinition, event } = findEvent({
        drawId: matchUp.drawId,
        tournamentRecord,
      }));
    }

    const structure =
      matchUp.structureId && drawDefinition?.structures?.find(({ structureId }) => structureId === matchUp.structureId);

    matchUpType =
      params.matchUpType ||
      structure?.matchUpType ||
      drawDefinition?.matchUpType ||
      (event?.eventType !== TEAM && event?.eventType);
  }

  const { milliseconds, time } = matchUpDuration({ matchUp });
  const { startTime } = matchUpStartTime({ matchUp });
  const { endTime } = matchUpEndTime({ matchUp });

  let schedule;
  const { visibilityThreshold, eventIds, drawIds } = scheduleVisibilityFilters ?? {};

  if ((!eventIds || eventIds.includes(matchUp.eventId)) && (!drawIds || drawIds.includes(matchUp.drawId))) {
    const scheduleSource = { matchUp, visibilityThreshold };
    const { allocatedCourts } = matchUpAllocatedCourts(scheduleSource);
    const { homeParticipantId } = getHomeParticipantId(scheduleSource);
    const { scheduledTime } = scheduledMatchUpTime(scheduleSource);
    const { timeModifiers } = matchUpTimeModifiers(scheduleSource);
    let { scheduledDate } = scheduledMatchUpDate(scheduleSource);
    const { venueId } = matchUpAssignedVenueId(scheduleSource);
    const { courtId } = matchUpAssignedCourtId(scheduleSource);
    const { courtOrder } = matchUpCourtOrder(scheduleSource);

    let timeAfterRecovery, averageMinutes, recoveryMinutes, typeChangeRecoveryMinutes, typeChangeTimeAfterRecovery;

    const eventType = matchUp.matchUpType ?? matchUpType;
    if (scheduleTiming && scheduledTime && afterRecoveryTimes && eventType) {
      const timingDetails = {
        matchUpFormat: matchUp.matchUpFormat ?? matchUpFormat,
        ...scheduleTiming,
      };
      ({
        averageMinutes = 0,
        recoveryMinutes = 0,
        typeChangeRecoveryMinutes = 0,
      } = matchUpFormatTimes({
        timingDetails,
        eventType,
      }));

      if (averageMinutes || recoveryMinutes) {
        timeAfterRecovery = endTime
          ? addMinutesToTimeString(extractTime(endTime), recoveryMinutes)
          : addMinutesToTimeString(scheduledTime, averageMinutes + recoveryMinutes);
      }
      if (typeChangeRecoveryMinutes) {
        typeChangeTimeAfterRecovery = endTime
          ? addMinutesToTimeString(extractTime(endTime), typeChangeRecoveryMinutes)
          : addMinutesToTimeString(scheduledTime, averageMinutes + typeChangeRecoveryMinutes);
      }
    }

    if (!scheduledDate && scheduledTime) scheduledDate = extractDate(scheduledTime);

    const isoDateString = getIsoDateString({ scheduledDate, scheduledTime });

    const venueDataMap = {};
    const venueData = (tournamentRecord && venueId && getVenueData({ tournamentRecord, venueId }))?.venueData || {};

    if (venueId) venueDataMap[venueId] = venueData;
    const { venueName, venueAbbreviation, courtsInfo } = venueData;

    const courtInfo = courtId && courtsInfo?.find((courtInfo) => courtInfo.courtId === courtId);
    const courtName = courtInfo?.courtName;

    for (const allocatedCourt of allocatedCourts || []) {
      if (!tournamentRecord) break;
      if (allocatedCourt.venueId && !venueDataMap[allocatedCourt.venueid]) {
        venueDataMap[allocatedCourt.venueId] = getVenueData({
          venueId: allocatedCourt.venueId,
          tournamentRecord,
        })?.venueData;
      }
      const vData = venueDataMap[allocatedCourt.venueId];
      allocatedCourt.venueName = vData?.venueName;
      const courtInfo = vData?.courtsInfo?.find((courtInfo) => courtInfo.courtId === allocatedCourt.courtId);
      allocatedCourt.courtName = courtInfo?.courtName;
    }

    schedule = definedAttributes({
      typeChangeTimeAfterRecovery,
      timeAfterRecovery,
      scheduledDate,
      scheduledTime,
      isoDateString,

      allocatedCourts,
      homeParticipantId,
      timeModifiers,
      venueAbbreviation,
      venueName,
      venueId,
      courtOrder,
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
      milliseconds,
      startTime,
      endTime,
      time,
    });
  }

  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const { scheduledTime } = scheduledMatchUpTime({ matchUp });

  if (usePublishState && publishStatus?.displaySettings?.draws) {
    const drawSettings = publishStatus.displaySettings.draws;
    const scheduleDetails = (drawSettings?.[matchUp.drawId] ?? drawSettings?.default)?.scheduleDetails;
    if (scheduleDetails) {
      const scheduleAttributes = (
        scheduleDetails.find((details) => scheduledDate && details.dates?.includes(scheduledDate)) ??
        scheduleDetails.find((details) => !details.dates?.length)
      )?.attributes;

      if (scheduleAttributes) {
        // set all attributes to true
        const template = Object.assign(
          {},
          ...Object.keys(schedule).map((key) => ({ [key]: true })),
          // overwrite with publishStatus attributes
          scheduleAttributes,
        );
        schedule = attributeFilter({
          source: schedule,
          template,
        });
      }
    }
  }

  const hasCompletedStatus = matchUp.matchUpStatus && completedMatchUpStatuses.includes(matchUp.matchUpStatus);

  const endDate =
    (hasCompletedStatus && (extractDate(endTime) || extractDate(scheduledDate) || extractDate(scheduledTime))) ||
    undefined;

  return { schedule, endDate };
}
