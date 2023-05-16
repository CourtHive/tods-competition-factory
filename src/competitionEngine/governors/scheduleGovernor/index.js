import { modifyEventMatchUpFormatTiming } from './matchUpFormatTiming/modifyEventMatchUpFormatTiming';
import { getMatchUpFormatTimingUpdate } from './matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { getEventMatchUpFormatTiming } from './matchUpFormatTiming/getEventMatchUpFormatTiming';
import { validateSchedulingProfile } from '../../../global/validation/validateSchedulingProfile';
import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { getScheduledRoundsDetails } from './schedulingProfile/getScheduledRoundsDetails';
import { findMatchUpFormatTiming } from './matchUpFormatTiming/findMatchUpFormatTiming';
import { getMatchUpDependencies } from './scheduleMatchUps/getMatchUpDependencies';
import { calculateScheduleTimes } from './scheduleMatchUps/calculateScheduleTimes';
import { scheduleProfileRounds } from './schedulingProfile/scheduleProfileRounds';
import { removeEventMatchUpFormatTiming } from './removeEventMatchUpFormatTiming';
import { toggleParticipantCheckInState } from './toggleParticipantCheckInState';
import { generateVirtualCourts } from './schedulers/utils/generateVirtualCourts';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { getMatchUpDailyLimitsUpdate } from './getMatchUpDailyLimitsUpdate';
import { getRounds, getProfileRounds } from './schedulingProfile/getRounds';
import { bulkUpdateCourtAssignments } from './bulkUpdateCourtAssignments';
import { scheduleMatchUps } from './scheduleMatchUps/scheduleMatchUps';
import { generateBookings } from './schedulers/utils/generateBookings';
import { reorderUpcomingMatchUps } from './reorderUpcomingMatchUps';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';
import { bulkRescheduleMatchUps } from './bulkRescheduleMatchUps';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { matchUpScheduleChange } from './matchUpScheduleChange';
import { getMatchUpDailyLimits } from './getMatchUpDailyLimits';
import {
  addSchedulingProfileRound,
  getSchedulingProfile,
  setSchedulingProfile,
} from './schedulingProfile/schedulingProfile';
import {
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
  addMatchUpScheduleItems,
  addMatchUpCourtOrder,
  allocateTeamMatchUpCourts,
  assignMatchUpVenue,
  assignMatchUpCourt,
} from './scheduleMatchUps/addScheduleItems';
import {
  addPersonRequests,
  getPersonRequests,
  modifyPersonRequests,
  removePersonRequests,
} from './scheduleMatchUps/personRequests';

const scheduleGovernor = {
  scheduleMatchUps,
  scheduleProfileRounds,
  clearScheduledMatchUps,
  bulkRescheduleMatchUps,
  getScheduledRoundsDetails,
  getMatchUpDependencies,
  generateVirtualCourts,
  generateBookings,

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
  removeEventMatchUpFormatTiming,

  getMatchUpDailyLimitsUpdate, // document
  getMatchUpDailyLimits,
  setMatchUpDailyLimits,
  getProfileRounds,
  getRounds,

  assignMatchUpVenue,
  assignMatchUpCourt,
  allocateTeamMatchUpCourts,
  addMatchUpScheduleItems, // test
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpCourtOrder,
  addMatchUpStartTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpEndTime,
  addMatchUpOfficial, // test

  getSchedulingProfile,
  setSchedulingProfile,
  addSchedulingProfileRound,
  validateSchedulingProfile,

  addPersonRequests,
  getPersonRequests,
  modifyPersonRequests,
  removePersonRequests,
};

export default scheduleGovernor;
