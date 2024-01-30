import { addMatchUpScheduledTime, addMatchUpTimeModifiers } from './scheduledTime';
import { getMatchUpDependencies } from '@Query/matchUps/getMatchUpDependencies';
import { modifyMatchUpNotice } from '@Mutate/notifications/drawNotifications';
import { scheduledMatchUpDate } from '@Query/matchUp/scheduledMatchUpDate';
import { allocateTeamMatchUpCourts } from './allocateTeamMatchUpCourts';
import { getParticipants } from '@Query/participants/getParticipants';
import { dateValidation, validTimeString } from '@Validators/regex';
import { addMatchUpTimeItem } from '../timeItems/matchUpTimeItems';
import { decorateResult } from '@Functions/global/decorateResult';
import { assignMatchUpCourt } from './assignMatchUpCourt';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import { findDrawMatchUp } from '@Acquire/findDrawMatchUp';
import { findParticipant } from '@Acquire/findParticipant';
import { isConvertableInteger } from '@Tools/math';
import { ensureInt } from '@Tools/ensureInt';
import { convertTime, extractDate, extractTime, formatDate, getIsoDateString, validTimeValue } from '@Tools/dateTime';

// constants and types
import { AddScheduleAttributeArgs, ResultType } from '@Types/factoryTypes';
import { INDIVIDUAL } from '@Constants/participantConstants';
import { OFFICIAL } from '@Constants/participantRoles';
import { SUCCESS } from '@Constants/resultConstants';
import { HydratedMatchUp } from '@Types/hydrated';
import {
  MISSING_MATCHUP_ID,
  INVALID_RESUME_TIME,
  INVALID_START_TIME,
  EXISTING_END_TIME,
  INVALID_STOP_TIME,
  INVALID_END_TIME,
  INVALID_DATE,
  INVALID_TIME,
  MISSING_DRAW_DEFINITION,
  MISSING_VALUE,
  ANACHRONISM,
  INVALID_VALUES,
  ErrorType,
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '@Constants/errorConditionConstants';
import {
  START_TIME,
  STOP_TIME,
  RESUME_TIME,
  END_TIME,
  SCHEDULED_DATE,
  COURT_ORDER,
} from '@Constants/timeItemConstants';
import { DrawDefinition, Event, TimeItem } from '@Types/tournamentTypes';

function timeDate(value, scheduledDate) {
  const time = validTimeString.test(value) ? value : extractTime(value);
  const date = extractDate(value) || extractDate(scheduledDate) || formatDate(new Date());

  // doesn't matter if this is invalid due to undefined time because this is used for sorting only
  return new Date(`${date}T${time}`).getTime();
}

type AddMatchUpScheduleItemsArgs = {
  inContextMatchUps?: HydratedMatchUp[];
  drawMatchUps?: HydratedMatchUp[];
  drawDefinition: DrawDefinition;
  errorOnAnachronism?: boolean;
  removePriorValues?: boolean;
  checkChronology?: boolean;
  matchUpDependencies?: any;
  disableNotice?: boolean;
  tournamentRecords: any;
  tournamentRecord: any;
  matchUpId: string;
  schedule: any;
  event?: Event;
};

export function addMatchUpScheduleItems({
  errorOnAnachronism = false,
  checkChronology = true,
  matchUpDependencies,
  inContextMatchUps,
  removePriorValues,
  tournamentRecords,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  drawMatchUps,
  matchUpId,
  schedule,
  event,
}: AddMatchUpScheduleItemsArgs): {
  error?: ErrorType;
  success?: boolean;
  warnings?: any[];
  info?: any;
} {
  if (!schedule) return { error: MISSING_VALUE, info: 'Missing schedule' };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const stack = 'addMatchUpScheduleItems';
  let matchUp, warning;

  if (!drawMatchUps) {
    const result = findDrawMatchUp({ drawDefinition, event, matchUpId });
    if (result.error) return result;
    matchUp = result.matchUp;
  } else {
    matchUp = drawMatchUps.find((drawMatchUp) => drawMatchUp.matchUpId === matchUpId);
  }

  const {
    endTime,
    courtId,
    courtIds,
    courtOrder,
    resumeTime,
    scheduledDate,
    scheduledTime,
    startTime,
    stopTime,
    timeModifiers,
    venueId,
  } = schedule;

  if (checkChronology && (!matchUpDependencies || !inContextMatchUps)) {
    ({ matchUpDependencies, matchUps: inContextMatchUps } = getMatchUpDependencies({
      drawDefinition,
    }));
  }

  const priorMatchUpIds = matchUpDependencies?.[matchUpId]?.matchUpIds;
  if (schedule.scheduledDate && checkChronology && priorMatchUpIds) {
    const priorMatchUpTimes = inContextMatchUps
      ?.filter(
        (matchUp) =>
          (matchUp.schedule?.scheduledDate || extractDate(matchUp.schedule?.scheduledTime)) &&
          priorMatchUpIds.includes(matchUp.matchUpId),
      )
      .map(({ schedule }) => {
        const isoDateString = getIsoDateString(schedule);
        return new Date(isoDateString).getTime();
      });

    if (priorMatchUpTimes?.length) {
      const isoDateString = getIsoDateString(schedule);
      const matchUpTime = new Date(isoDateString).getTime();
      const maxPriorMatchUpTime = Math.max(...priorMatchUpTimes);
      if (maxPriorMatchUpTime >= matchUpTime) {
        if (errorOnAnachronism) {
          return decorateResult({ result: { error: ANACHRONISM }, stack });
        } else {
          warning = ANACHRONISM;
        }
      }
    }
  }

  if (scheduledDate !== undefined) {
    const result = addMatchUpScheduledDate({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      scheduledDate,
      matchUpId,
    });
    if (result?.error) return decorateResult({ result, stack, context: { scheduledDate } });
  }
  if (scheduledTime !== undefined) {
    const result = addMatchUpScheduledTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      scheduledTime,
      matchUpId,
      matchUp,
    });
    if (result?.error) return decorateResult({ result, stack, context: { scheduledTime } });
  }
  if (startTime !== undefined) {
    const result = addMatchUpStartTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      startTime,
      event,
    });
    if (result?.error) return decorateResult({ result, stack, context: { startTime } });
  }
  if (stopTime !== undefined) {
    const result = addMatchUpStopTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      stopTime,
      event,
    });
    if (result?.error) return decorateResult({ result, stack, context: { stopTime } });
  }
  if (resumeTime !== undefined) {
    const result = addMatchUpResumeTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      resumeTime,
      matchUpId,
      event,
    });
    if (result?.error) return decorateResult({ result, stack, context: { resumeTime } });
  }
  if (endTime !== undefined) {
    const result = addMatchUpEndTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      endTime,
      event,
    });
    if (result?.error) return decorateResult({ result, stack, context: { endTime } });
  }
  if (courtIds !== undefined) {
    const result = allocateTeamMatchUpCourts({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      courtIds,
    });
    if (result?.error) return decorateResult({ result, stack, context: { courtIds } });
  }
  if (courtId !== undefined && scheduledDate !== undefined) {
    const result = assignMatchUpCourt({
      courtDayDate: scheduledDate,
      disableNotice: true,
      removePriorValues,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      courtId,
    });
    if (result?.error) return decorateResult({ result, stack, context: { courtId } });
  }

  if (venueId !== undefined) {
    const result = assignMatchUpVenue({
      disableNotice: true,
      removePriorValues,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      venueId,
    });
    if (result?.error) return decorateResult({ result, stack, context: { venueId } });
  }

  if (courtOrder !== undefined && isConvertableInteger(courtOrder)) {
    const result = addMatchUpCourtOrder({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      courtOrder,
      matchUpId,
    });
    if (result?.error) return decorateResult({ result, stack, context: { courtOrder } });
  }

  if (timeModifiers !== undefined) {
    const result = addMatchUpTimeModifiers({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      timeModifiers,
      matchUpId,
      matchUp,
    });
    if (result?.error) return decorateResult({ result, stack, context: { timeModifiers } });
  }

  if (!disableNotice) {
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      context: stack,
      drawDefinition,
      matchUp,
    });
  }

  return warning ? { ...SUCCESS, warnings: [warning] } : { ...SUCCESS };
}

export function addMatchUpScheduledDate({
  scheduledDate: dateToSchedule,
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
}: AddScheduleAttributeArgs & { scheduledDate?: string }): ResultType {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: if there is existing scheduledDate and no other relevant timeItems, delete prior

  // TODO: check that scheduledDate is within range of event dates / tournament dates
  // TODO: check that 1) scheduledDate is valid date and 2) is in range for tournament
  // this must be done in tournamentEngine wrapper

  const validDate = dateToSchedule && dateValidation.test(dateToSchedule);
  if (dateToSchedule && !validDate) return { error: INVALID_DATE };

  const scheduledDate = extractDate(dateToSchedule);

  const timeItem = {
    itemValue: scheduledDate,
    itemType: SCHEDULED_DATE,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpCourtOrder({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  courtOrder,
  matchUpId,
}: AddScheduleAttributeArgs & { courtOrder?: number }) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtOrder && !isConvertableInteger(courtOrder))
    return { error: INVALID_VALUES, info: 'courtOrder must be numeric' };

  const itemValue = courtOrder && ensureInt(courtOrder);
  const timeItem = {
    itemType: COURT_ORDER,
    itemValue,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpOfficial({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  participantId,
  officialType,
  matchUpId,
}: AddScheduleAttributeArgs & {
  participantId?: string;
  officialType?: string;
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: check that 1) participantId has the appropriate participantRole

  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  if (tournamentRecord) {
    const tournamentParticipants =
      getParticipants({
        tournamentRecord,
        participantFilters: {
          participantTypes: [INDIVIDUAL],
          participantRoles: [OFFICIAL],
        },
      }).participants ?? [];

    const participant = findParticipant({
      tournamentParticipants,
      participantId,
    });

    if (!participant) return { error: PARTICIPANT_NOT_FOUND };
  }

  const timeItem: TimeItem = {
    itemType: 'SCHEDULE.ASSIGNMENT.OFFICIAL',
    itemValue: participantId,
  };
  if (officialType) timeItem.itemSubTypes = [officialType];

  return addMatchUpTimeItem({
    duplicateValues: false,
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpStartTime({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  startTime,
  event,
}: AddScheduleAttributeArgs & { startTime?: string }) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(startTime)) return { error: INVALID_TIME };

  const { matchUp } = findDrawMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp?.timeItems ?? [];

  const earliestRelevantTimeValue = timeItems
    .filter((timeItem: any) => [STOP_TIME, RESUME_TIME, END_TIME].includes(timeItem?.itemType))
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce((earliest: any, timeValue) => (!earliest || timeValue < earliest ? timeValue : earliest), undefined);

  // START_TIME must be prior to any STOP_TIMEs, RESUME_TIMEs and STOP_TIME
  if (!earliestRelevantTimeValue || timeDate(startTime, scheduledDate) < earliestRelevantTimeValue) {
    // there can be only one START_TIME; if a prior START_TIME exists, remove it
    if (matchUp?.timeItems) {
      matchUp.timeItems = matchUp.timeItems.filter((timeItem) => timeItem.itemType !== START_TIME);
    }

    const militaryTime = convertTime(startTime, true, true);
    const timeItem = { itemType: START_TIME, itemValue: militaryTime };

    return addMatchUpTimeItem({
      duplicateValues: false,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      disableNotice,
      matchUpId,
      timeItem,
    });
  } else {
    return { error: INVALID_START_TIME };
  }
}

export function addMatchUpEndTime({
  validateTimeSeries = true,
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  endTime,
  event,
}: AddScheduleAttributeArgs & {
  validateTimeSeries?: boolean;
  endTime?: string;
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(endTime)) return { error: INVALID_TIME };

  const { matchUp } = findDrawMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp?.timeItems ?? [];

  const latestRelevantTimeValue = timeItems
    .filter((timeItem: any) => [START_TIME, RESUME_TIME, STOP_TIME].includes(timeItem?.itemType))
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce((latest: any, timeValue) => (!latest || timeValue > latest ? timeValue : latest), undefined);

  // END_TIME must be after any START_TIMEs, STOP_TIMEs, RESUME_TIMEs
  if (!validateTimeSeries || !latestRelevantTimeValue || timeDate(endTime, scheduledDate) > latestRelevantTimeValue) {
    // there can be only one END_TIME; if a prior END_TIME exists, remove it
    if (matchUp?.timeItems) {
      matchUp.timeItems = matchUp.timeItems.filter((timeItem) => timeItem.itemType !== END_TIME);
    }

    // All times stored as military time
    const militaryTime = convertTime(endTime, true, true);
    const timeItem = { itemType: END_TIME, itemValue: militaryTime };

    return addMatchUpTimeItem({
      duplicateValues: false,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      disableNotice,
      matchUpId,
      timeItem,
    });
  } else {
    return { error: INVALID_END_TIME };
  }
}

export function addMatchUpStopTime({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  stopTime,
  event,
}: AddScheduleAttributeArgs & {
  stopTime?: string;
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(stopTime)) return { error: INVALID_TIME };

  const { matchUp } = findDrawMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp?.timeItems ?? [];

  // can't add a STOP_TIME if the matchUp is not STARTED or RESUMED, or has START_TIME
  // if latest relevaant timeItem is a STOP_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime: any, timeItem) => {
    return timeItem.itemType === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: EXISTING_END_TIME };

  const relevantTimeItems = timeItems
    .filter((timeItem: any) => [START_TIME, RESUME_TIME, STOP_TIME].includes(timeItem?.itemType))
    .sort((a, b) => timeDate(a.itemValue, scheduledDate) - timeDate(b.itemValue, scheduledDate));

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsStop = lastRelevantTimeItem && lastRelevantTimeItem.itemType === STOP_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter((timeItem) => !lastRelevantTimeItemIsStop || timeItem.createdAt !== lastRelevantTimeItem.createdAt)
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce((latest: any, timeValue) => (!latest || timeValue > latest ? timeValue : latest), undefined);

  if (timeDate(stopTime, scheduledDate) > latestRelevantTimeValue) {
    if (matchUp?.timeItems && lastRelevantTimeItemIsStop) {
      const targetTimeStamp = lastRelevantTimeItem.createdAt;
      matchUp.timeItems = matchUp.timeItems.filter((timeItem) => timeItem.createdAt !== targetTimeStamp);
    }

    // All times stored as military time
    const militaryTime = convertTime(stopTime, true, true);
    const timeItem = {
      itemValue: militaryTime,
      itemType: STOP_TIME,
    };

    return addMatchUpTimeItem({
      duplicateValues: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      disableNotice,
      matchUpId,
      timeItem,
    });
  } else {
    return { error: INVALID_STOP_TIME };
  }
}

export function addMatchUpResumeTime({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  resumeTime,
  matchUpId,
  event,
}: AddScheduleAttributeArgs & {
  resumeTime?: string;
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(resumeTime)) return { error: INVALID_TIME };

  const { matchUp } = findDrawMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp?.timeItems ?? [];

  // can't add a RESUME_TIME if the matchUp is not STOPPED, or if it has ENDED
  // if latest relevaant timeItem is a RESUME_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime: any, timeItem) => {
    return timeItem.itemType === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: EXISTING_END_TIME };

  const relevantTimeItems = timeItems
    .filter((timeItem: any) => [START_TIME, RESUME_TIME, STOP_TIME].includes(timeItem?.itemType))
    .sort((a, b) => timeDate(a.itemValue, scheduledDate) - timeDate(b.itemValue, scheduledDate));

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsResume = lastRelevantTimeItem && lastRelevantTimeItem.itemType === RESUME_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter((timeItem) => !lastRelevantTimeItemIsResume || timeItem.createdAt !== lastRelevantTimeItem.createdAt)
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce((latest: any, timeValue) => (!latest || timeValue > latest ? timeValue : latest), undefined);

  if (timeDate(resumeTime, scheduledDate) > latestRelevantTimeValue) {
    if (matchUp?.timeItems && lastRelevantTimeItemIsResume) {
      const targetTimeStamp = lastRelevantTimeItem.createdAt;
      matchUp.timeItems = matchUp.timeItems.filter((timeItem) => timeItem.createdAt !== targetTimeStamp);
    }

    // All times stored as military time
    const militaryTime = convertTime(resumeTime, true, true);
    const timeItem = {
      itemValue: militaryTime,
      itemType: RESUME_TIME,
    };

    return addMatchUpTimeItem({
      duplicateValues: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      disableNotice,
      matchUpId,
      timeItem,
    });
  } else {
    return { error: INVALID_RESUME_TIME };
  }
}
