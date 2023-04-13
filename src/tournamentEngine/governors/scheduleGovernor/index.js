import { getMatchUpDependencies } from '../../../competitionEngine/governors/scheduleGovernor/scheduleMatchUps/getMatchUpDependencies';
import { modifyEventMatchUpFormatTiming } from './matchUpFormatTiming/modifyEventMatchUpFormatTiming';
import { removeEventMatchUpFormatTiming } from './matchUpFormatTiming/removeEventMatchUpFormatTiming';
import { getMatchUpFormatTimingUpdate } from './matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { validateSchedulingProfile } from '../../../global/validation/validateSchedulingProfile';
import { getModifiedMatchUpFormatTiming } from './matchUpFormatTiming/getModifiedMatchUpTiming';
import { getEventMatchUpFormatTiming } from './matchUpFormatTiming/getEventMatchUpFormatTiming';
import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { getMatchUpFormatTiming } from './matchUpFormatTiming/getMatchUpFormatTiming';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { getMatchUpDailyLimitsUpdate } from './getMatchUpDailyLimitsUpdate';
import { allocateTeamMatchUpCourts } from './allocateTeamMatchUpCourts';
import { bulkRescheduleMatchUps } from './bulkRescheduleMatchUps';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { getMatchUpDailyLimits } from './getMatchUpDailyLimits';
import { clearMatchUpSchedule } from './clearMatchUpSchedule';
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
  allocateTeamMatchUpCourts,
  assignMatchUpCourt,
  assignMatchUpVenue,

  clearMatchUpSchedule,
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
  getMatchUpDependencies,

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
