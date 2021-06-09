import { getTournamentParticipants } from '../../getters/participants/getTournamentParticipants';
import { findParticipant } from '../../../common/deducers/findParticipant';
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

export function addMatchUpScheduleItems(props) {
  return addScheduleItems(props);
}

export function addMatchUpScheduledDate({
  drawDefinition,
  matchUpId,
  disableNotice,
  scheduledDate,
}) {
  // TODO: check that scheduledDate is within range of event dates / tournament dates

  const result = addScheduledDate({
    drawDefinition,
    matchUpId,
    disableNotice,
    scheduledDate,
  });

  return result;
}

export function addMatchUpScheduledTime({
  drawDefinition,
  scheduledTime,
  matchUpId,
  disableNotice,
}) {
  // TODO: check that scheduledTime is within range of event dates / tournament dates

  const result = addScheduledTime({
    drawDefinition,
    matchUpId,
    scheduledTime,
    disableNotice,
  });
  return result;
}

export function addMatchUpStartTime({
  drawDefinition,
  matchUpId,
  startTime,
  disableNotice,
}) {
  const result = addStartTime({
    drawDefinition,
    matchUpId,
    startTime,
    disableNotice,
  });
  return result;
}

export function addMatchUpEndTime({
  drawDefinition,
  matchUpId,
  endTime,
  disableNotice,
}) {
  const result = addEndTime({
    drawDefinition,
    matchUpId,
    endTime,
    disableNotice,
  });
  return result;
}

export function addMatchUpStopTime({
  drawDefinition,
  matchUpId,
  stopTime,
  disableNotice,
}) {
  const result = addStopTime({
    drawDefinition,
    matchUpId,
    stopTime,
    disableNotice,
  });
  return result;
}

export function addMatchUpResumeTime({
  drawDefinition,
  matchUpId,
  resumeTime,
  disableNotice,
}) {
  const result = addResumeTime({
    drawDefinition,
    matchUpId,
    resumeTime,
    disableNotice,
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
