import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { getEventMatchUpFormatTiming } from './getEventMatchUpFormatTiming';
import { getModifiedMatchUpFormatTiming } from './getModifiedMatchUpTiming';
import { getMatchUpFormatTimingUpdate } from './getMatchUpFormatTimingUpdate';
import { modifyMatchUpFormatTiming } from './modifyMatchUpFormatTiming';
import { getMatchUpFormatTiming } from './getMatchUpFormatTiming';
import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';
import { assignMatchUpCourt } from './assignMatchUpCourt';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import {
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
  addMatchUpScheduleItems,
} from './scheduleItems';

const scheduleGovernor = {
  assignMatchUpCourt,
  assignMatchUpVenue,

  addMatchUpScheduleItems,
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,

  getMatchUpFormatTiming,
  getEventMatchUpFormatTiming,
  modifyMatchUpFormatTiming,
  getModifiedMatchUpFormatTiming,
  getMatchUpFormatTimingUpdate,

  removeMatchUpCourtAssignment,

  bulkScheduleMatchUps,
};

export default scheduleGovernor;
