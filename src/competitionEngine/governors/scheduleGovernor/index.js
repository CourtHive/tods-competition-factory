import { modifyEventMatchUpFormatTiming } from './matchUpFormatTiming/modifyEventMatchUpFormatTiming';
import { getMatchUpFormatTimingUpdate } from './matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { getEventMatchUpFormatTiming } from './matchUpFormatTiming/getEventMatchUpFormatTiming';
import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { findMatchUpFormatTiming } from './matchUpFormatTiming/findMatchUpFormatTiming';
import { calculateScheduleTimes } from './scheduleMatchUps/calculateScheduleTimes';
import { scheduleProfileRounds } from './schedulingProfile/scheduleProfileRounds';
import { toggleParticipantCheckInState } from './toggleParticipantCheckInState';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { getMatchUpDailyLimitsUpdate } from './getMatchUpDailyLimitsUpdate';
import { bulkUpdateCourtAssignments } from './bulkUpdateCourtAssignments';
import { scheduleMatchUps } from './scheduleMatchUps/scheduleMatchUps';
import { reorderUpcomingMatchUps } from './reorderUpcomingMatchUps';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { matchUpScheduleChange } from './matchUpScheduleChange';
import { getMatchUpDailyLimits } from './getMatchUpDailyLimits';
import {
  addSchedulingProfileRound,
  getSchedulingProfile,
  isValidSchedulingProfile,
  setSchedulingProfile,
} from './schedulingProfile/schedulingProfile';
import {
  addPersonRequests,
  getPersonRequests,
  modifyPersonRequests,
  removePersonRequests,
} from './scheduleMatchUps/personRequests';
import {
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
} from './scheduleMatchUps/addScheduleItems';

const scheduleGovernor = {
  scheduleMatchUps,
  scheduleProfileRounds,

  matchUpScheduleChange,
  calculateScheduleTimes,
  reorderUpcomingMatchUps,
  bulkUpdateCourtAssignments,
  removeMatchUpCourtAssignment,
  toggleParticipantCheckInState,

  findMatchUpFormatTiming,
  modifyMatchUpFormatTiming,
  modifyEventMatchUpFormatTiming,
  getMatchUpFormatTimingUpdate,
  getEventMatchUpFormatTiming,

  getMatchUpDailyLimits,
  setMatchUpDailyLimits,
  getMatchUpDailyLimitsUpdate, // document

  addMatchUpScheduledDate, // document
  addMatchUpScheduledTime, // document
  addMatchUpStartTime, // document
  addMatchUpStopTime, // document
  addMatchUpResumeTime, // document
  addMatchUpEndTime, // document
  addMatchUpOfficial, // document

  getSchedulingProfile,
  setSchedulingProfile,
  isValidSchedulingProfile,
  addSchedulingProfileRound,

  addPersonRequests,
  getPersonRequests,
  modifyPersonRequests,
  removePersonRequests,
};

export default scheduleGovernor;
