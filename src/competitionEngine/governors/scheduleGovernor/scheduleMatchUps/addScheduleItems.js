import { assignMatchUpVenue as assignVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import { assignMatchUpCourt as assignCourt } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import {
  addMatchUpScheduledDate as addScheduledDate,
  addMatchUpScheduledTime as addScheduledTime,
  addMatchUpStartTime as addStartTime,
  addMatchUpEndTime as addEndTime,
  addMatchUpResumeTime as addResumeTime,
  addMatchUpStopTime as addStopTime,
  addMatchUpOfficial as addOfficial,
  addMatchUpScheduleItems as addScheduleItems,
} from '../../../../tournamentEngine/governors/scheduleGovernor/scheduleItems';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';
import { findTournamentId } from '../../competitionsGovernor/findTournamentId';

export function addMatchUpScheduleItems(params) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

  return addScheduleItems({ ...params, tournamentRecord, drawDefinition });
}

export function addMatchUpScheduledDate(params) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = params;
  return addScheduledDate({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpScheduledTime(params) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

  const { disableNotice, scheduledTime, matchUpId } = params;
  return addScheduledTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledTime,
    matchUpId,
  });
}

export function addMatchUpStartTime(params) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

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
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

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
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

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
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

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
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

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
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

  const { matchUpId, venueId, disableNotice } = params;

  return assignVenue({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    matchUpId,
    venueId,
  });
}

export function assignMatchUpCourt(params) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(params);
  if (error) return { error };

  const { matchUpId, courtId, courtDayDate, disableNotice } = params;

  return assignCourt({
    tournamentRecord,
    disableNotice,
    drawDefinition,
    courtDayDate,
    matchUpId,
    courtId,
  });
}

function getDrawDefinition({ tournamentRecords, tournamentId, drawId }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof tournamentId !== 'string') {
    // find tournamentId by brute force if not provided
    tournamentId = findTournamentId({ tournamentRecords, drawId });
    if (!tournamentId) return { error: MISSING_TOURNAMENT_ID };
  }

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const { drawDefinition, error } = findEvent({ tournamentRecord, drawId });
  return { drawDefinition, error, tournamentRecord };
}
