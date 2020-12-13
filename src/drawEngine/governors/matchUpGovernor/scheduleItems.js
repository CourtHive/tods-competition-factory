import { addTimeItem } from './timeItems';
import { findMatchUp } from '../../getters/getMatchUps';

import {
  ASSIGNMENT,
  COURT,
  END_TIME,
  OFFICIAL,
  RESUME_TIME,
  SCHEDULED_DATE,
  SCHEDULED_TIME,
  START_TIME,
  STOP_TIME,
  VENUE,
} from '../../../constants/timeItemConstants';

import {
  MISSING_DATE,
  MISSING_MATCHUP_ID,
  INVALID_RESUME_TIME,
  INVALID_START_TIME,
  EXISTING_END_TIME,
  INVALID_STOP_TIME,
  INVALID_END_TIME,
  INVALID_DATE,
  INVALID_TIME,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  dateValidation,
  timeValidation,
  validTimeString,
} from '../../../fixtures/validations/regex';
import { formatDate } from '../../../utilities/dateTime';

/* 
  local version of addTimeItem for functions in this module which
  access the matchUp WITHOUT CONTEXT, necessary to modify original
*/
function newTimeItem({ matchUp, timeItem }) {
  if (!matchUp.timeItems) matchUp.timeItems = [];
  const createdAt = new Date().toISOString();
  Object.assign(timeItem, { createdAt });
  matchUp.timeItems.push(timeItem);

  return SUCCESS;
}

function timeDate(value) {
  if (validTimeString.test(value)) {
    const today = formatDate(new Date());
    return new Date(`${today}T${value}`);
  } else {
    return new Date(value);
  }
}

function validTimeValue(value) {
  return !!(value === undefined || timeValidation.test(value));
}

export function addMatchUpScheduledDayDate({
  drawDefinition,
  matchUpId,
  scheduledDayDate,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: if there is existing scheduledDayDate and no other relevant timeItems, delete prior

  // TODO: check that 1) scheduledDayDate is valid date and 2) is in range for tournament
  // this must be done in tournamentEngine wrapper

  const validDate = dateValidation.test(scheduledDayDate);
  if (!validDate) return { error: INVALID_DATE };

  const timeItem = {
    itemSubject: SCHEDULED_DATE,
    itemValue: scheduledDayDate,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}

export function addMatchUpScheduledTime({
  drawDefinition,
  matchUpId,
  scheduledTime,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // must support undefined as a value so that scheduledTime can be cleared
  if (!validTimeValue(scheduledTime)) return { error: INVALID_TIME };

  // TODO: scheduleTime must be on same day as scheduledDayDate (if it exists)
  // TODO: check that scheduledTime is a date object with time

  const itemValue = scheduledTime;
  const timeItem = {
    itemSubject: SCHEDULED_TIME,
    itemValue,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}

export function assignMatchUpCourt({
  drawDefinition,
  matchUpId,
  courtId,
  courtDayDate,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (courtDayDate === undefined) return { error: MISSING_DATE };

  const timeItem = {
    itemSubject: COURT,
    itemType: ASSIGNMENT,
    itemValue: courtId,
    itemDate: courtDayDate,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}

export function assignMatchUpVenue({
  drawDefinition,
  matchUpId,
  venueId,
  venueDayDate,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (venueDayDate === undefined) return { error: MISSING_DATE };

  const timeItem = {
    itemSubject: VENUE,
    itemType: ASSIGNMENT,
    itemValue: venueId,
    itemDate: venueDayDate,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}

export function addMatchUpOfficial({
  drawDefinition,
  matchUpId,
  participantId,
  officialType,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  // TODO: check that 1) participantId has the appropriate participantRole

  const timeItem = {
    itemSubject: OFFICIAL,
    itemType: ASSIGNMENT,
    itemSubType: officialType,
    itemValue: participantId,
  };

  return addTimeItem({ drawDefinition, matchUpId, timeItem });
}

export function addMatchUpStartTime({ drawDefinition, matchUpId, startTime }) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(startTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  const timeItems = matchUp.timeItems || [];

  const earliestRelevantTimeValue = timeItems
    .filter((timeItem) =>
      [STOP_TIME, RESUME_TIME, END_TIME].includes(timeItem.itemSubject)
    )
    .map((timeItem) => timeDate(timeItem.itemValue))
    .reduce(
      (earliest, timeValue) =>
        !earliest || timeValue < earliest ? timeValue : earliest,
      undefined
    );

  // START_TIME must be prior to any STOP_TIMEs, RESUME_TIMEs and STOP_TIME
  if (
    !earliestRelevantTimeValue ||
    timeDate(startTime) < earliestRelevantTimeValue
  ) {
    // there can be only one START_TIME; if a prior START_TIME exists, remove it
    matchUp.timeItems = matchUp.timeItems.filter(
      (timeItem) => timeItem.itemSubject !== START_TIME
    );
    const timeItem = { itemSubject: START_TIME, itemValue: startTime };
    return newTimeItem({ matchUp, timeItem });
  } else {
    return { error: INVALID_START_TIME };
  }
}

export function addMatchUpEndTime({ drawDefinition, matchUpId, endTime }) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(endTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  const timeItems = matchUp.timeItems || [];

  const latestRelevantTimeValue = timeItems
    .filter((timeItem) =>
      [START_TIME, STOP_TIME, RESUME_TIME].includes(timeItem.itemSubject)
    )
    .map((timeItem) => timeDate(timeItem.itemValue))
    .reduce(
      (latest, timeValue) =>
        !latest || timeValue > latest ? timeValue : latest,
      undefined
    );

  // END_TIME must be after any START_TIMEs, STOP_TIMEs, RESUME_TIMEs
  if (!latestRelevantTimeValue || timeDate(endTime) > latestRelevantTimeValue) {
    // there can be only one END_TIME; if a prior END_TIME exists, remove it
    matchUp.timeItems = matchUp.timeItems.filter(
      (timeItem) => timeItem.itemSubject !== END_TIME
    );
    const timeItem = { itemSubject: END_TIME, itemValue: endTime };
    return newTimeItem({ matchUp, timeItem });
  } else {
    return { error: INVALID_END_TIME };
  }
}

export function addMatchUpStopTime({ drawDefinition, matchUpId, stopTime }) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(stopTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  const timeItems = matchUp.timeItems || [];

  // can't add a STOP_TIME if the matchUp is not STARTED or RESUMED, or has START_TIME
  // if latest relevaant timeItem is a STOP_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime, timeItem) => {
    return timeItem.itemSubject === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: EXISTING_END_TIME };

  const relevantTimeItems = timeItems
    .filter((timeItem) =>
      [START_TIME, STOP_TIME, RESUME_TIME].includes(timeItem.itemSubject)
    )
    // .sort((a, b) => new Date(a.itemValue) - new Date(b.itemValue));
    .sort((a, b) => timeDate(a.itemValue) - timeDate(b.itemValue));

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsStop =
    lastRelevantTimeItem && lastRelevantTimeItem.itemSubject === STOP_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter(
      (timeItem) =>
        !lastRelevantTimeItemIsStop ||
        timeItem.createdAt !== lastRelevantTimeItem.createdAt
    )
    // .map(timeItem => new Date(timeItem.itemValue))
    .map((timeItem) => timeDate(timeItem.itemValue))
    .reduce(
      (latest, timeValue) =>
        !latest || timeValue > latest ? timeValue : latest,
      undefined
    );

  // if (new Date(stopTime) > latestRelevantTimeValue) {
  if (timeDate(stopTime) > latestRelevantTimeValue) {
    if (lastRelevantTimeItemIsStop) {
      const targetTimeStamp = lastRelevantTimeItem.createdAt;
      matchUp.timeItems = matchUp.timeItems.filter(
        (timeItem) => timeItem.createdAt !== targetTimeStamp
      );
    }

    const timeItem = {
      itemSubject: STOP_TIME,
      itemValue: stopTime,
    };

    return newTimeItem({ matchUp, timeItem });
  } else {
    return { error: INVALID_STOP_TIME };
  }
}

export function addMatchUpResumeTime({
  drawDefinition,
  matchUpId,
  resumeTime,
}) {
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };
  if (!validTimeValue(resumeTime)) return { error: INVALID_TIME };

  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });
  const timeItems = matchUp.timeItems || [];

  // can't add a RESUME_TIME if the matchUp is not STOPPED, or if it has ENDED
  // if latest relevaant timeItem is a RESUME_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime, timeItem) => {
    return timeItem.itemSubject === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: EXISTING_END_TIME };

  const relevantTimeItems = timeItems
    .filter((timeItem) =>
      [START_TIME, STOP_TIME, RESUME_TIME].includes(timeItem.itemSubject)
    )
    // .sort((a, b) => new Date(a.itemValue) - new Date(b.itemValue));
    .sort((a, b) => timeDate(a.itemValue) - timeDate(b.itemValue));

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsResume =
    lastRelevantTimeItem && lastRelevantTimeItem.itemSubject === RESUME_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter(
      (timeItem) =>
        !lastRelevantTimeItemIsResume ||
        timeItem.createdAt !== lastRelevantTimeItem.createdAt
    )
    // .map(timeItem => new Date(timeItem.itemValue))
    .map((timeItem) => timeDate(timeItem.itemValue))
    .reduce(
      (latest, timeValue) =>
        !latest || timeValue > latest ? timeValue : latest,
      undefined
    );

  // if (new Date(resumeTime) > latestRelevantTimeValue) {
  if (timeDate(resumeTime) > latestRelevantTimeValue) {
    if (lastRelevantTimeItemIsResume) {
      const targetTimeStamp = lastRelevantTimeItem.createdAt;
      matchUp.timeItems = matchUp.timeItems.filter(
        (timeItem) => timeItem.createdAt !== targetTimeStamp
      );
    }

    const timeItem = {
      itemSubject: RESUME_TIME,
      itemValue: resumeTime,
    };

    return newTimeItem({ matchUp, timeItem });
  } else {
    return { error: INVALID_RESUME_TIME };
  }
}
