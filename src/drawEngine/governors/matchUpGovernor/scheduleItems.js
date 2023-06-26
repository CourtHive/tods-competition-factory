import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { allocateTeamMatchUpCourts } from '../../../tournamentEngine/governors/scheduleGovernor/allocateTeamMatchUpCourts';
import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { assignMatchUpVenue } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { addMatchUpScheduledTime } from './scheduleTimeItems/scheduledTime';
import { addMatchUpTimeModifiers } from './scheduleTimeItems/timeModifiers';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { decorateResult } from '../../../global/functions/decorateResult';
import { scheduledMatchUpDate } from '../../accessors/matchUpAccessor';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isConvertableInteger } from '../../../utilities/math';
import { addMatchUpTimeItem } from './timeItems';
import {
  convertTime,
  extractDate,
  extractTime,
  formatDate,
  getIsoDateString,
  validTimeValue,
} from '../../../utilities/dateTime';
import {
  dateValidation,
  validTimeString,
} from '../../../fixtures/validations/regex';

import { SUCCESS } from '../../../constants/resultConstants';
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
} from '../../../constants/errorConditionConstants';
import {
  START_TIME,
  STOP_TIME,
  RESUME_TIME,
  END_TIME,
  SCHEDULED_DATE,
  COURT_ORDER,
} from '../../../constants/timeItemConstants';

function timeDate(value, scheduledDate) {
  const time = validTimeString.test(value) ? value : extractTime(value);
  const date =
    extractDate(value) || extractDate(scheduledDate) || formatDate(new Date());

  // doesn't matter if this is invalid due to undefined time because this is used for sorting only
  return new Date(`${date}T${time}`);
}

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
}) {
  if (!schedule) return { error: MISSING_VALUE, info: 'Missing schedule' };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const stack = 'drawEngine.addMatchUpScheduleItems';
  let matchUp, warning;

  if (!drawMatchUps) {
    const result = findMatchUp({ drawDefinition, event, matchUpId });
    if (result.error) return result;
    matchUp = result.matchUp;
  } else {
    matchUp = drawMatchUps.find(
      (drawMatchUp) => drawMatchUp.matchUpId === matchUpId
    );
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
    ({ matchUpDependencies, matchUps: inContextMatchUps } =
      getMatchUpDependencies({
        drawDefinition,
      }));
  }

  const priorMatchUpIds = matchUpDependencies?.[matchUpId]?.matchUpIds;
  if (schedule.scheduledDate && checkChronology && priorMatchUpIds) {
    const priorMatchUpTimes = inContextMatchUps
      .filter(
        (matchUp) =>
          (matchUp.schedule?.scheduledDate ||
            extractDate(matchUp.schedule?.scheduledTime)) &&
          priorMatchUpIds.includes(matchUp.matchUpId)
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
    if (result?.error)
      return decorateResult({ result, stack, context: { scheduledDate } });
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
    if (result?.error)
      return decorateResult({ result, stack, context: { scheduledTime } });
  }
  if (startTime !== undefined) {
    const result = addMatchUpStartTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      startTime,
      matchUp,
      event,
    });
    if (result?.error)
      return decorateResult({ result, stack, context: { startTime } });
  }
  if (stopTime !== undefined) {
    const result = addMatchUpStopTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      stopTime,
      matchUp,
      event,
    });
    if (result?.error)
      return decorateResult({ result, stack, context: { stopTime } });
  }
  if (resumeTime !== undefined) {
    const result = addMatchUpResumeTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      resumeTime,
      matchUpId,
      matchUp,
      event,
    });
    if (result?.error)
      return decorateResult({ result, stack, context: { resumeTime } });
  }
  if (endTime !== undefined) {
    const result = addMatchUpEndTime({
      disableNotice: true,
      removePriorValues,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      endTime,
      matchUp,
      event,
    });
    if (result?.error)
      return decorateResult({ result, stack, context: { endTime } });
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
    if (result?.error)
      return decorateResult({ result, stack, context: { courtIds } });
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
    if (result?.error)
      return decorateResult({ result, stack, context: { courtId } });
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
    if (result?.error)
      return decorateResult({ result, stack, context: { venueId } });
  }

  if (courtOrder !== undefined && isConvertableInteger(courtOrder)) {
    const result = addMatchUpCourtOrder({
      disableNotice: true,
      removePriorValues,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      courtOrder,
      matchUpId,
    });
    if (result?.error)
      return decorateResult({ result, stack, context: { courtOrder } });
  }

  if (timeModifiers !== undefined) {
    const result = addMatchUpTimeModifiers({
      disableNotice: true,
      removePriorValues,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      timeModifiers,
      matchUpId,
      matchUp,
    });
    if (result?.error)
      return decorateResult({ result, stack, context: { timeModifiers } });
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
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  scheduledDate,
  matchUpId,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: if there is existing scheduledDate and no other relevant timeItems, delete prior

  // TODO: check that 1) scheduledDate is valid date and 2) is in range for tournament
  // this must be done in tournamentEngine wrapper

  const validDate = dateValidation.test(scheduledDate);
  if (scheduledDate && !validDate) return { error: INVALID_DATE };

  const timeItem = {
    itemType: SCHEDULED_DATE,
    itemValue: scheduledDate,
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
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtOrder && !isConvertableInteger(courtOrder))
    return { error: INVALID_VALUES, info: 'courtOrder must be numeric' };

  const itemValue = parseInt(courtOrder);
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
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: check that 1) participantId has the appropriate participantRole

  const timeItem = {
    itemType: 'SCHEDULE.ASSIGNMENT.OFFICIAL',
    itemSubTypes: [officialType],
    itemValue: participantId,
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

export function addMatchUpStartTime({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  startTime,
  event,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(startTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp.timeItems || [];

  const earliestRelevantTimeValue = timeItems
    .filter((timeItem) =>
      [STOP_TIME, RESUME_TIME, END_TIME].includes(timeItem?.itemType)
    )
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce(
      (earliest, timeValue) =>
        !earliest || timeValue < earliest ? timeValue : earliest,
      undefined
    );

  // START_TIME must be prior to any STOP_TIMEs, RESUME_TIMEs and STOP_TIME
  if (
    !earliestRelevantTimeValue ||
    timeDate(startTime, scheduledDate) < earliestRelevantTimeValue
  ) {
    // there can be only one START_TIME; if a prior START_TIME exists, remove it
    if (matchUp.timeItems) {
      matchUp.timeItems = matchUp.timeItems.filter(
        (timeItem) => timeItem.itemType !== START_TIME
      );
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
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(endTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp.timeItems || [];

  const latestRelevantTimeValue = timeItems
    .filter((timeItem) =>
      [START_TIME, RESUME_TIME, STOP_TIME].includes(timeItem?.itemType)
    )
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce(
      (latest, timeValue) =>
        !latest || timeValue > latest ? timeValue : latest,
      undefined
    );

  // END_TIME must be after any START_TIMEs, STOP_TIMEs, RESUME_TIMEs
  if (
    !validateTimeSeries ||
    !latestRelevantTimeValue ||
    timeDate(endTime, scheduledDate) > latestRelevantTimeValue
  ) {
    // there can be only one END_TIME; if a prior END_TIME exists, remove it
    if (matchUp.timeItems) {
      matchUp.timeItems = matchUp.timeItems.filter(
        (timeItem) => timeItem.itemType !== END_TIME
      );
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
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(stopTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp.timeItems || [];

  // can't add a STOP_TIME if the matchUp is not STARTED or RESUMED, or has START_TIME
  // if latest relevaant timeItem is a STOP_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime, timeItem) => {
    return timeItem.itemType === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: EXISTING_END_TIME };

  const relevantTimeItems = timeItems
    .filter((timeItem) =>
      [START_TIME, RESUME_TIME, STOP_TIME].includes(timeItem?.itemType)
    )
    .sort(
      (a, b) =>
        timeDate(a.itemValue, scheduledDate) -
        timeDate(b.itemValue, scheduledDate)
    );

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsStop =
    lastRelevantTimeItem && lastRelevantTimeItem.itemType === STOP_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter(
      (timeItem) =>
        !lastRelevantTimeItemIsStop ||
        timeItem.createdAt !== lastRelevantTimeItem.createdAt
    )
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce(
      (latest, timeValue) =>
        !latest || timeValue > latest ? timeValue : latest,
      undefined
    );

  if (timeDate(stopTime, scheduledDate) > latestRelevantTimeValue) {
    if (matchUp.timeItems && lastRelevantTimeItemIsStop) {
      const targetTimeStamp = lastRelevantTimeItem.createdAt;
      matchUp.timeItems = matchUp.timeItems.filter(
        (timeItem) => timeItem.createdAt !== targetTimeStamp
      );
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
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(resumeTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  const { scheduledDate } = scheduledMatchUpDate({ matchUp });
  const timeItems = matchUp.timeItems || [];

  // can't add a RESUME_TIME if the matchUp is not STOPPED, or if it has ENDED
  // if latest relevaant timeItem is a RESUME_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime, timeItem) => {
    return timeItem.itemType === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: EXISTING_END_TIME };

  const relevantTimeItems = timeItems
    .filter((timeItem) =>
      [START_TIME, RESUME_TIME, STOP_TIME].includes(timeItem?.itemType)
    )
    .sort(
      (a, b) =>
        timeDate(a.itemValue, scheduledDate) -
        timeDate(b.itemValue, scheduledDate)
    );

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsResume =
    lastRelevantTimeItem && lastRelevantTimeItem.itemType === RESUME_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter(
      (timeItem) =>
        !lastRelevantTimeItemIsResume ||
        timeItem.createdAt !== lastRelevantTimeItem.createdAt
    )
    .map((timeItem) => timeDate(timeItem.itemValue, scheduledDate))
    .reduce(
      (latest, timeValue) =>
        !latest || timeValue > latest ? timeValue : latest,
      undefined
    );

  if (timeDate(resumeTime, scheduledDate) > latestRelevantTimeValue) {
    if (matchUp.timeItems && lastRelevantTimeItemIsResume) {
      const targetTimeStamp = lastRelevantTimeItem.createdAt;
      matchUp.timeItems = matchUp.timeItems.filter(
        (timeItem) => timeItem.createdAt !== targetTimeStamp
      );
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
