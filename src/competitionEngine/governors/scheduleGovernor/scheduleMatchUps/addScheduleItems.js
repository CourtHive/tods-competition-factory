import { assignMatchUpVenue as assignVenue } from '../../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpVenue';
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

export function addMatchUpScheduleItems(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  return addScheduleItems({ ...props, tournamentRecord, drawDefinition });
}

export function addMatchUpScheduledDate(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addScheduledDate({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpScheduledTime(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addScheduledTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpStartTime(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addStartTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpEndTime(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addEndTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpStopTime(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addStopTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpResumeTime(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, scheduledDate, matchUpId } = props;
  return addResumeTime({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    scheduledDate,
    matchUpId,
  });
}

export function addMatchUpOfficial(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { disableNotice, participantId, officialType, matchUpId } = props;
  return addOfficial({
    tournamentRecord,
    drawDefinition,
    disableNotice,
    participantId,
    officialType,
    matchUpId,
  });
}

export function assignMatchUpVenue(props) {
  const { tournamentRecord, drawDefinition, error } = getDrawDefinition(props);
  if (error) return { error };

  const { matchUpId, venueId, disableNotice } = props;

  return assignVenue({
    tournamentRecord,
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

  const { drawDefinition, error } = findEvent({ tournamentRecord, drawId });
  return { drawDefinition, error, tournamentRecord };
}
