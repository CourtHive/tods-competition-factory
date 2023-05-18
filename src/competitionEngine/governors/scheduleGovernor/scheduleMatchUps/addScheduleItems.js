import { allocateTeamMatchUpCourts as allocateCourts } from '../../../../tournamentEngine/governors/scheduleGovernor/allocateTeamMatchUpCourts';
import { assignMatchUpVenue as assignVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { assignMatchUpCourt as assignCourt } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { findTournamentId } from '../../competitionsGovernor/findTournamentId';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';
import {
  addMatchUpScheduledDate as addScheduledDate,
  addMatchUpScheduledTime as addScheduledTime,
  addMatchUpStartTime as addStartTime,
  addMatchUpEndTime as addEndTime,
  addMatchUpResumeTime as addResumeTime,
  addMatchUpStopTime as addStopTime,
  addMatchUpOfficial as addOfficial,
  addMatchUpScheduleItems as addScheduleItems,
  addMatchUpCourtOrder as addCourtOrder,
} from '../../../../tournamentEngine/governors/scheduleGovernor/scheduleItems';

import {
  MISSING_DRAW_ID,
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function addMatchUpScheduleItems(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  return addScheduleItems({ ...params, tournamentRecord, drawDefinition });
}

export function addMatchUpScheduledDate(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, scheduledDate, matchUpId, removePriorValues } = params;
  return addScheduledDate({
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpScheduledTime(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, scheduledTime, matchUpId, removePriorValues } = params;
  return addScheduledTime({
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledTime,
    matchUpId,
  });
}

export function addMatchUpStartTime(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, startTime, matchUpId } = params;
  return addStartTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    startTime,
    matchUpId,
  });
}

export function addMatchUpEndTime(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, endTime, matchUpId } = params;
  return addEndTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    endTime,
    matchUpId,
  });
}

export function addMatchUpStopTime(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, stopTime, matchUpId } = params;
  return addStopTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    stopTime,
    matchUpId,
  });
}

export function addMatchUpResumeTime(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, resumeTime, matchUpId } = params;
  return addResumeTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    resumeTime,
    matchUpId,
  });
}

export function addMatchUpOfficial(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const { disableNotice, participantId, officialType, matchUpId } = params;
  return addOfficial({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    participantId,
    officialType,
    matchUpId,
  });
}

export function assignMatchUpVenue(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;
  const { matchUpId, venueId, disableNotice, removePriorValues } = params;

  return assignVenue({
    removePriorValues,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    venueId,
  });
}

export function assignMatchUpCourt(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const {
    removePriorValues,
    tournamentRecords,
    disableNotice,
    courtDayDate,
    matchUpId,
    courtId,
  } = params;

  return assignCourt({
    removePriorValues,
    tournamentRecords,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    courtDayDate,
    matchUpId,
    courtId,
  });
}

export function allocateTeamMatchUpCourts(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const {
    removePriorValues,
    tournamentRecords,
    disableNotice,
    courtDayDate,
    matchUpId,
    courtIds,
  } = params;

  return allocateCourts({
    removePriorValues,
    tournamentRecords,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    courtDayDate,
    matchUpId,
    courtIds,
  });
}

export function addMatchUpCourtOrder(params) {
  const result = getDrawDefinition(params);
  if (result.error) return result;
  const { tournamentRecord, drawDefinition } = result;

  const {
    removePriorValues,
    tournamentRecords,
    disableNotice,
    courtOrder,
    matchUpId,
    courtId,
  } = params;

  return addCourtOrder({
    removePriorValues,
    tournamentRecords,
    tournamentRecord,
    drawDefinition,
    disableNotice,
    courtOrder,
    matchUpId,
    courtId,
  });
}

function getDrawDefinition({ tournamentRecords, tournamentId, drawId }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (!drawId) return { error: MISSING_DRAW_ID };
  if (typeof tournamentId !== 'string') {
    // find tournamentId by brute force if not provided
    tournamentId = findTournamentId({ tournamentRecords, drawId });
    if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
  }

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = findEvent({ tournamentRecord, drawId });
  if (result.error)
    return decorateResult({ result, stack: 'getDrawDefinition' });
  return { drawDefinition: result.drawDefinition, tournamentRecord };
}
