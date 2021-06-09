import { assignMatchUpVenue as assignVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
import {
  addMatchUpScheduledDate as addScheduledDate,
  addMatchUpScheduledTime as addScheduledTime,
  addMatchUpStartTime as addStartTime,
  addMatchUpEndTime as addEndTime,
  addMatchUpResumeTime as addResumeTime,
  addMatchUpStopTime as addStopTime,
  addMatchUpOfficial as addOfficial,
} from '../../../../tournamentEngine/governors/scheduleGovernor/scheduleItems';
import { findEvent } from '../../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_TOURNAMENT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../constants/errorConditionConstants';

export function addMatchUpScheduledDate(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addScheduledDate({
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpScheduledTime(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addScheduledTime({
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpStartTime(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addStartTime({
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpEndTime(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addEndTime({
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpStopTime(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addStopTime({
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpResumeTime(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addResumeTime({
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpOfficial(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, participantId, officialType, matchUpId } = props;
  return addOfficial({
    drawDefinition,
    disableNotice,
    participantId,
    officialType,
    matchUpId,
  });
}

export function assignMatchUpVenue(props) {
  const { drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { matchUpId, venueId, disableNotice } = props;
  return assignVenue({
    drawDefinition,
    disableNotice,
    matchUpId,
    venueId,
  });
}

function getDrawDefinition({ tournamentRecords, tournamentId, drawId }) {
  if (!tournamentRecords) return { error: MISSING_TOURNAMENT_RECORDS };
  if (typeof tournamentId !== 'string') return { error: MISSING_TOURNAMENT_ID };

  const tournamentRecord = tournamentRecords[tournamentId];
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  return findEvent({ tournamentRecord, drawId });
}
