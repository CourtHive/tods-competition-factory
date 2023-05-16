import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { allocateTeamMatchUpCourts } from '../../../tournamentEngine/governors/scheduleGovernor/allocateTeamMatchUpCourts';
import { assignMatchUpCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { assignMatchUpVenue } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { decorateResult } from '../../../global/functions/decorateResult';
import { scheduledMatchUpDate } from '../../accessors/matchUpAccessor';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addMatchUpTimeItem } from './timeItems';
import {
  extractDate,
  extractTime,
  formatDate,
  getIsoDateString,
} from '../../../utilities/dateTime';
import {
  dateValidation,
  timeValidation,
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
  MATCHUP_NOT_FOUND,
  MISSING_VALUE,
  ANACHRONISM,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';
import {
  START_TIME,
  STOP_TIME,
  RESUME_TIME,
  END_TIME,
  SCHEDULED_TIME,
  SCHEDULED_DATE,
  COURT_ORDER,
} from '../../../constants/timeItemConstants';
import { isNumeric } from '../../../utilities/math';

function timeDate(value, scheduledDate) {
  const time = validTimeString.test(value) ? value : extractTime(value);
  const date =
    extractDate(value) || extractDate(scheduledDate) || formatDate(new Date());

  // doesn't matter if this is invalid due to undefined time because this is used for sorting only
  return new Date(`${date}T${time}`);
}

function validTimeValue(value) {
  return !!(value === undefined || timeValidation.test(value));
}

export function addMatchUpScheduleItems({
  errorOnAnachronism = false,
  checkChronology = true,
  matchUpDependencies,
  tournamentRecords,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  matchUps,
  schedule,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!schedule) return { error: MISSING_VALUE };
  const stack = 'addMatchUpScheduleItems';
  let warning;

  const { matchUp } = findMatchUp({ drawDefinition, event, matchUpId });
  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

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
    venueId,
  } = schedule;

  if (checkChronology && (!matchUpDependencies || !matchUps)) {
    ({ matchUpDependencies, matchUps } = getMatchUpDependencies({
      drawDefinition,
    }));
  }

  const priorMatchUpIds = matchUpDependencies?.[matchUpId]?.matchUpIds;
  if (schedule.scheduledDate && checkChronology && priorMatchUpIds) {
    const priorMatchUpTimes = matchUps
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
      tournamentRecord,
      disableNotice: true,
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
      tournamentRecord,
      drawDefinition,
      scheduledTime,
      matchUpId,
    });
    if (result?.error) return { error: result.error, scheduledTime };
  }
  if (startTime !== undefined) {
    const result = addMatchUpStartTime({
      disableNotice: true,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      startTime,
      event,
    });
    if (result?.error) return { error: result.error, startTime };
  }
  if (stopTime !== undefined) {
    const result = addMatchUpStopTime({
      disableNotice: true,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      stopTime,
      event,
    });
    if (result?.error) return { error: result.error, stopTime };
  }
  if (resumeTime !== undefined) {
    const result = addMatchUpResumeTime({
      disableNotice: true,
      tournamentRecord,
      drawDefinition,
      resumeTime,
      matchUpId,
      event,
    });
    if (result?.error) return { error: result.error, resumeTime };
  }
  if (endTime !== undefined) {
    const result = addMatchUpEndTime({
      disableNotice: true,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      endTime,
      event,
    });
    if (result?.error) return { error: result.error, endTime };
  }
  if (courtIds !== undefined) {
    const result = allocateTeamMatchUpCourts({
      disableNotice: true,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      courtIds,
    });
    if (result?.error) return { error: result.error, context: { courtIds } };
  }
  if (courtId !== undefined && scheduledDate !== undefined) {
    const result = assignMatchUpCourt({
      courtDayDate: scheduledDate,
      disableNotice: true,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      courtId,
      event,
    });
    if (result?.error) return { error: result.error, courtId };
  } else if (venueId !== undefined) {
    const result = assignMatchUpVenue({
      disableNotice: true,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      venueId,
      event,
    });
    if (result?.error) return { error: result.error, venueId };
  }
  if (courtOrder !== undefined) {
    const result = addMatchUpCourtOrder({
      disableNotice: true,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      courtOrder,
      matchUpId,
      event,
    });
    if (result?.error) return { error: result.error, venueId };
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
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpCourtOrder({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  courtOrder,
  matchUpId,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  if (courtOrder && !isNumeric(courtOrder))
    return { error: INVALID_VALUES, info: 'courtOrder must be numeric' };

  const itemValue = courtOrder;
  const timeItem = {
    itemType: COURT_ORDER,
    itemValue,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpScheduledTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  scheduledTime,
  matchUpId,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // must support undefined as a value so that scheduledTime can be cleared
  if (!validTimeValue(scheduledTime)) return { error: INVALID_TIME };

  // TODO: if scheduledDate and scheduleTime includes date, must be on same day as scheduledDate

  const itemValue = scheduledTime;
  const timeItem = {
    itemType: SCHEDULED_TIME,
    itemValue,
  };

  return addMatchUpTimeItem({
    duplicateValues: false,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpOfficial({
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
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    timeItem,
  });
}

export function addMatchUpStartTime({
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
    const timeItem = { itemType: START_TIME, itemValue: startTime };
    return addMatchUpTimeItem({
      duplicateValues: false,
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
    const timeItem = { itemType: END_TIME, itemValue: endTime };
    return addMatchUpTimeItem({
      duplicateValues: false,
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

    const timeItem = {
      itemType: STOP_TIME,
      itemValue: stopTime,
    };

    return addMatchUpTimeItem({
      duplicateValues: true,
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

    const timeItem = {
      itemType: RESUME_TIME,
      itemValue: resumeTime,
    };

    return addMatchUpTimeItem({
      duplicateValues: true,
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
