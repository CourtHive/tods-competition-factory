import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findParticipant } from '../../../common/deducers/findParticipant';
import {
  addMatchUpScheduledDayDate as addScheduledDayDate,
  addMatchUpScheduledTime as addScheduledTime,
  addMatchUpResumeTime as addResumeTime,
  addMatchUpStartTime as addStartTime,
  addMatchUpStopTime as addStopTime,
  addMatchUpOfficial as addOfficial,
  addMatchUpEndTime as addEndTime,
} from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';

import { INDIVIDUAL } from '../../../constants/participantTypes';
import { OFFICIAL } from '../../../constants/participantRoles';
import {
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

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
    drawDefinition,
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
    drawDefinition,
    matchUpId,
    resumeTime,
  });
  return result;
}

export function addMatchUpOfficial({
  tournamentRecord,
  drawDefinition,
  participantId,
  officialType,
  matchUpId,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: {
      participantTypes: [INDIVIDUAL],
      participantRoles: [OFFICIAL],
    },
  });

  const { participant } = findParticipant({
    tournamentParticipants,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  const result = addOfficial({
    drawDefinition,
    participantId,
    officialType,
    matchUpId,
  });
  return result;
}
