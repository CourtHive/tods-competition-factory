import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import {
  addMatchUpScheduleItems as addScheduleItems,
  addMatchUpScheduledDate as addScheduledDate,
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

export function addMatchUpScheduleItems(params) {
  return addScheduleItems(params);
}

export function addMatchUpScheduledDate({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  scheduledDate,
  matchUpId,
}) {
  // TODO: check that scheduledDate is within range of event dates / tournament dates

  const result = addScheduledDate({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });

  return result;
}

export function addMatchUpScheduledTime({
  tournamentRecord,
  drawDefinition,
  scheduledTime,
  disableNotice,
  matchUpId,
}) {
  // TODO: check that scheduledTime is within range of event dates / tournament dates

  const result = addScheduledTime({
    tournamentRecord,
    drawDefinition,
    scheduledTime,
    disableNotice,
    matchUpId,
  });
  return result;
}

export function addMatchUpStartTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  startTime,
}) {
  const result = addStartTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    startTime,
  });
  return result;
}

export function addMatchUpEndTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  endTime,
}) {
  const result = addEndTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    endTime,
  });
  return result;
}

export function addMatchUpStopTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  stopTime,
}) {
  const result = addStopTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    stopTime,
  });
  return result;
}

export function addMatchUpResumeTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  resumeTime,
  matchUpId,
}) {
  const result = addResumeTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    resumeTime,
    matchUpId,
  });
  return result;
}

export function addMatchUpOfficial({
  tournamentRecord,
  drawDefinition,
  participantId,
  officialType,
  matchUpId,
  disableNotice,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { tournamentParticipants } = getTournamentParticipants({
    tournamentRecord,
    participantFilters: {
      participantTypes: [INDIVIDUAL],
      participantRoles: [OFFICIAL],
    },
  });

  const participant = findParticipant({
    tournamentParticipants,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  const result = addOfficial({
    drawDefinition,
    participantId,
    officialType,
    matchUpId,
    disableNotice,
  });
  return result;
}
