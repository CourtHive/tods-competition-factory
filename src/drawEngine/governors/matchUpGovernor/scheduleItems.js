import { addTimeItem } from './timeItems';
import { findMatchUp } from '../../getters/getMatchUps';

import {
  START_TIME, END_TIME,
  STOP_TIME, RESUME_TIME,
  COURT, ASSIGNMENT, OFFICIAL,
  SCHEDULED_DATE, SCHEDULED_TIME,
} from '../../../constants/timeItemConstants';

import { SUCCESS } from '../../../constants/resultConstants';

/* 
  local version of addTimeItem for functions in this module which
  access the matchUp WITHOUT CONTEXT, necessary to modify original
*/
function newTimeItem({matchUp, timeItem}) {
  if (!matchUp.timeItems) matchUp.timeItems = [];
  const timeStamp = new Date().toISOString();
  Object.assign(timeItem, { timeStamp });
  matchUp.timeItems.push(timeItem);

  return SUCCESS;
}

export function addMatchUpScheduledDayDate({drawDefinition, matchUpId, scheduledDayDate}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  // TODO: if there is existing scheduledDayDate and no other relevant timeItems, delete prior

  // TODO: check that 1) scheduledDayDate is valid date and 2) is in range for tournament
  // this must be done in tournamentEngine wrapper

  const itemValue = new Date(scheduledDayDate).toISOString();
  const timeItem = {
    itemSubject: SCHEDULED_DATE,
    itemValue
  };

  return addTimeItem({drawDefinition, matchUpId, timeItem});
}

export function addMatchUpScheduledTime({drawDefinition, matchUpId, scheduledTime}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  // TODO: scheduleTime must be on same day as scheduledDayDate (if it exists)

  // TODO: check that 1) scheduledDayDate is valid date and 2) is in range for tournament
  // this must be done in tournamentEngine wrapper

  const itemValue = scheduledTime;
  const timeItem = {
    itemSubject: SCHEDULED_TIME,
    itemValue
  };

  return addTimeItem({drawDefinition, matchUpId, timeItem});
}

export function assignMatchUpCourt({drawDefinition, matchUpId, courtId, courtDayDate}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };
  if (courtId === undefined) return { error: 'Missing courtId' }; // if no courtId then matchUp is being UNASSIGNED
  if (courtDayDate === undefined) return { error: 'Missing date' };

  const timeItem = {
    itemSubject: COURT,
    itemType: ASSIGNMENT,
    itemValue: courtId,
    itemDate: courtDayDate
  };

  return addTimeItem({drawDefinition, matchUpId, timeItem});
}

export function addMatchUpOfficial({drawDefinition, matchUpId, participantId, officialType}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  // TODO: check that 1) participantId has the appropriate participantRole

  const timeItem = {
    itemSubject: OFFICIAL,
    itemType: ASSIGNMENT,
    itemClass: officialType,
    itemValue: participantId
  };

  return addTimeItem({drawDefinition, matchUpId, timeItem});
}

export function addMatchUpStartTime({drawDefinition, matchUpId, startTime}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  const { matchUp } = findMatchUp({drawDefinition, matchUpId});
  const timeItems = matchUp.timeItems || [];

  const earliestRelevantTimeValue = timeItems
    .filter(timeItem => [STOP_TIME, RESUME_TIME, END_TIME].includes(timeItem.itemSubject))
    .map(timeItem => new Date(timeItem.itemValue))
    .reduce((earliest, timeValue) => !earliest || timeValue < earliest ? timeValue : earliest, undefined);

  // START_TIME must be prior to any STOP_TIMEs, RESUME_TIMEs and STOP_TIME
  if (!earliestRelevantTimeValue || new Date(startTime) < earliestRelevantTimeValue) {
    // there can be only one START_TIME; if a prior START_TIME exists, remove it
    matchUp.timeItems = matchUp.timeItems.filter(timeItem => timeItem.itemSubject !== START_TIME);
    const itemValue = new Date(startTime).toISOString();
    const timeItem = { itemSubject: START_TIME, itemValue };
    return newTimeItem({matchUp, timeItem});
  } else {
    return { error: 'Invalid Start Time' };
  }
}

export function addMatchUpEndTime({drawDefinition, matchUpId, endTime}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  const { matchUp } = findMatchUp({drawDefinition, matchUpId});
  const timeItems = matchUp.timeItems || [];
  
  const latestRelevantTimeValue = timeItems
    .filter(timeItem => [START_TIME, STOP_TIME, RESUME_TIME].includes(timeItem.itemSubject))
    .map(timeItem => new Date(timeItem.itemValue))
    .reduce((latest, timeValue) => !latest || timeValue > latest ? timeValue : latest, undefined);

  // END_TIME must be after any START_TIMEs, STOP_TIMEs, RESUME_TIMEs
  if (!latestRelevantTimeValue || new Date(endTime) > latestRelevantTimeValue) {
    // there can be only one END_TIME; if a prior END_TIME exists, remove it
    matchUp.timeItems = matchUp.timeItems.filter(timeItem => timeItem.itemSubject !== END_TIME);
    const itemValue = new Date(endTime).toISOString();
    const timeItem = { itemSubject: END_TIME, itemValue };
    return newTimeItem({matchUp, timeItem});
  } else {
    return { error: 'Invalid End Time' };
  }
}

export function addMatchUpStopTime({drawDefinition, matchUpId, stopTime}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  const { matchUp } = findMatchUp({drawDefinition, matchUpId});
  const timeItems = matchUp.timeItems || [];
  
  // can't add a STOP_TIME if the matchUp is not STARTED or RESUMED, or has START_TIME
  // if latest relevaant timeItem is a STOP_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime, timeItem) => {
    return timeItem.itemSubject === END_TIME || hasEndTime;
  }, undefined);

  if (hasEndTime) return { error: 'Existing End Time' };

  const relevantTimeItems = timeItems
    .filter(timeItem => [START_TIME, STOP_TIME, RESUME_TIME].includes(timeItem.itemSubject))
    .sort((a, b) => new Date(a.itemValue) - new Date(b.itemValue));

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsStop = lastRelevantTimeItem && lastRelevantTimeItem.itemSubject === STOP_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter(timeItem => !lastRelevantTimeItemIsStop || timeItem.timeStamp !== lastRelevantTimeItem.timeStamp)
    .map(timeItem => new Date(timeItem.itemValue))
    .reduce((latest, timeValue) => !latest || timeValue > latest ? timeValue : latest, undefined);

  if (new Date(stopTime) > latestRelevantTimeValue) {
    if (lastRelevantTimeItemIsStop) {
      const targetTimeStamp = lastRelevantTimeItem.timeStamp;
      matchUp.timeItems = matchUp.timeItems.filter(timeItem => timeItem.timeStamp !== targetTimeStamp);
    }
    
    const itemValue = new Date(stopTime).toISOString();
    const timeItem = {
      itemSubject: STOP_TIME,
      itemValue
    };

    return newTimeItem({matchUp, timeItem});
  } else {
    return { error: 'Invalid Stop Time' };
  }
}

export function addMatchUpResumeTime({drawDefinition, matchUpId, resumeTime}) {
  if (!matchUpId) return { error: 'Missing matchUpId' };

  const { matchUp } = findMatchUp({drawDefinition, matchUpId});
  const timeItems = matchUp.timeItems || [];
  
  // can't add a RESUME_TIME if the matchUp is not STOPPED, or if it has ENDED
  // if latest relevaant timeItem is a RESUME_TIME then overwrite

  const hasEndTime = timeItems.reduce((hasEndTime, timeItem) => {
    return timeItem.itemSubject === END_TIME || hasEndTime;
  }, undefined);
    
  if (hasEndTime) return { error: 'Existing End Time' };

  const relevantTimeItems = timeItems
    .filter(timeItem => [START_TIME, STOP_TIME, RESUME_TIME].includes(timeItem.itemSubject))
    .sort((a, b) => new Date(a.itemValue) - new Date(b.itemValue));

  const lastRelevantTimeItem = relevantTimeItems[relevantTimeItems.length - 1];
  const lastRelevantTimeItemIsResume = lastRelevantTimeItem && lastRelevantTimeItem.itemSubject === RESUME_TIME;

  const latestRelevantTimeValue = relevantTimeItems
    .filter(timeItem => !lastRelevantTimeItemIsResume || timeItem.timeStamp !== lastRelevantTimeItem.timeStamp)
    .map(timeItem => new Date(timeItem.itemValue))
    .reduce((latest, timeValue) => !latest || timeValue > latest ? timeValue : latest, undefined);

  if (new Date(resumeTime) > latestRelevantTimeValue) {
    if (lastRelevantTimeItemIsResume) {
      const targetTimeStamp = lastRelevantTimeItem.timeStamp;
      matchUp.timeItems = matchUp.timeItems.filter(timeItem => timeItem.timeStamp !== targetTimeStamp);
    }
    
    const itemValue = new Date(resumeTime).toISOString();
    const timeItem = {
      itemSubject: RESUME_TIME,
      itemValue
    };

    return newTimeItem({matchUp, timeItem});
  } else {
    return { error: 'Invalid Resume Time ' };
  }
}
