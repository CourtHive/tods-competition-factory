import {
  addMatchUpScheduledDayDate as addScheduledDayDate,
  addMatchUpScheduledTime as addScheduledTime,
  addMatchUpResumeTime as addResumeTime,
  addMatchUpStartTime as addStartTime,
  addMatchUpStopTime as addStopTime,
  addMatchUpOfficial as addOfficial,
  addMatchUpEndTime as addEndTime,
} from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';

export function addMatchUpScheduledDayDate({
  drawDefinition,
  matchUpId,
  scheduledDayDate,
}) {
  // TODO: check that scheduledDayDate is within range of event dates / tournament dates

  const result = addScheduledDayDate({
    drawDefinition,
    scheduledDayDate,
    matchUpId,
  });

  return result;
}

export function addMatchUpScheduledTime({
  drawDefinition,
  scheduledTime,
  matchUpId,
}) {
  // TODO: check that scheduledTime is within range of event dates / tournament dates

  const result = addScheduledTime({ drawDefinition, matchUpId, scheduledTime });
  return result;
}

export function addMatchUpStartTime({ drawDefinition, matchUpId, startTime }) {
  const result = addStartTime({
    drawDefinition,
    matchUpId,
    startTime,
  });
  return result;
}

export function addMatchUpEndTime({ drawDefinition, matchUpId, endTime }) {
  const result = addEndTime({
    drawDefinition,
    matchUpId,
    endTime,
  });
  return result;
}

export function addMatchUpStopTime({ drawDefinition, matchUpId, stopTime }) {
  const result = addStopTime({
    matchUpId,
    stopTime,
  });
  return result;
}

export function addMatchUpResumeTime({
  drawDefinition,
  matchUpId,
  resumeTime,
}) {
  const result = addResumeTime({
    matchUpId,
    resumeTime,
  });
  return result;
}

export function addMatchUpOfficial({
  drawDefinition,
  participantId,
  officialType,
  matchUpId,
}) {
  const result = addOfficial({
    drawDefinition,
    participantId,
    officialType,
    matchUpId,
  });
  return result;
}
