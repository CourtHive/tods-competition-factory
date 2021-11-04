import { modifyEventMatchUpFormatTiming } from './matchUpFormatTiming/modifyEventMatchUpFormatTiming';
import { removeEventMatchUpFormatTiming } from './matchUpFormatTiming/removeEventMatchUpFormatTiming';
import { getEventMatchUpFormatTiming } from './matchUpFormatTiming/getEventMatchUpFormatTiming';
import { getModifiedMatchUpFormatTiming } from './matchUpFormatTiming/getModifiedMatchUpTiming';
import { getMatchUpFormatTimingUpdate } from './matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { validateSchedulingProfile } from '../../../global/validation/validateSchedulingProfile';
import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { getMatchUpFormatTiming } from './matchUpFormatTiming/getMatchUpFormatTiming';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { getMatchUpDailyLimitsUpdate } from './getMatchUpDailyLimitsUpdate';
import { bulkRescheduleMatchUps } from './bulkRescheduleMatchUps';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { getMatchUpDailyLimits } from './getMatchUpDailyLimits';
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
import {
  getSchedulingProfile,
  setSchedulingProfile,
} from './schedulingProfile';

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
  modifyMatchUpFormatTiming,
  getModifiedMatchUpFormatTiming,
  getEventMatchUpFormatTiming,
  modifyEventMatchUpFormatTiming,
  removeEventMatchUpFormatTiming,
  getMatchUpFormatTimingUpdate,

  getMatchUpDailyLimits, // document
  setMatchUpDailyLimits, // document
  getMatchUpDailyLimitsUpdate, // document
  validateSchedulingProfile,

  setSchedulingProfile,
  getSchedulingProfile,

  removeMatchUpCourtAssignment,

  clearScheduledMatchUps,
  bulkScheduleMatchUps,
  bulkRescheduleMatchUps,
};

export default scheduleGovernor;
