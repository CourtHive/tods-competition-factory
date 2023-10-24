import { addMatchUpScheduledTime as addScheduledTime } from '../../../drawEngine/governors/matchUpGovernor/scheduleTimeItems/scheduledTime';
import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import { getParticipants } from '../../getters/participants/getParticipants';
import {
  addMatchUpScheduleItems as addScheduleItems,
  addMatchUpScheduledDate as addScheduledDate,
  addMatchUpResumeTime as addResumeTime,
  addMatchUpStartTime as addStartTime,
  addMatchUpStopTime as addStopTime,
  addMatchUpOfficial as addOfficial,
  addMatchUpEndTime as addEndTime,
  addMatchUpCourtOrder as addCourtOrder,
} from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import {
  MISSING_PARTICIPANT_ID,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  ParticipantRoleEnum,
  Tournament,
} from '../../../types/tournamentFromSchema';

export function addMatchUpScheduleItems(params) {
  return addScheduleItems(params);
}

type AddScheduleAttributeArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  removePriorValues?: boolean;
  disableNotice?: boolean;
  matchUpId: string;
  event?: Event;
};

export function addMatchUpScheduledDate({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  disableNotice,
  scheduledDate,
  matchUpId,
}: AddScheduleAttributeArgs & {
  scheduledDate?: string;
}) {
  // TODO: check that scheduledDate is within range of event dates / tournament dates

  return addScheduledDate({
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpScheduledTime({
  removePriorValues,
  tournamentRecord,
  drawDefinition,
  scheduledTime,
  disableNotice,
  matchUpId,
}: AddScheduleAttributeArgs & {
  scheduledTime?: string;
}) {
  // TODO: check that scheduledTime is within range of event dates / tournament dates

  return addScheduledTime({
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    scheduledTime,
    disableNotice,
    matchUpId,
  });
}

export function addMatchUpStartTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  startTime,
}) {
  return addStartTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    startTime,
  });
}

export function addMatchUpEndTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  endTime,
}) {
  return addEndTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    endTime,
  });
}

export function addMatchUpStopTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  matchUpId,
  stopTime,
}) {
  return addStopTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    stopTime,
  });
}

export function addMatchUpResumeTime({
  tournamentRecord,
  drawDefinition,
  disableNotice,
  resumeTime,
  matchUpId,
}) {
  return addResumeTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    resumeTime,
    matchUpId,
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
  return addCourtOrder({
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    courtOrder,
    matchUpId,
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
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const tournamentParticipants =
    getParticipants({
      tournamentRecord,
      participantFilters: {
        participantTypes: [INDIVIDUAL],
        participantRoles: [ParticipantRoleEnum.Official],
      },
    }).participants ?? [];

  const participant = findParticipant({
    tournamentParticipants,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  return addOfficial({
    drawDefinition,
    disableNotice,
    participantId,
    officialType,
    matchUpId,
  });
}
