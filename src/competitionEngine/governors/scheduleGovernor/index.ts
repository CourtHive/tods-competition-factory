import { getMatchUpFormatTimingUpdate } from '../../../query/extensions/matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { calculateScheduleTimes } from '../../../mutate/matchUps/schedule/scheduleMatchUps/calculateScheduleTimes';
import { generateVirtualCourts } from '../../../mutate/matchUps/schedule/schedulers/utils/generateVirtualCourts';
import { getMatchUpDailyLimitsUpdate } from '../../../query/extensions/getMatchUpDailyLimitsUpdate';
import { bulkUpdateCourtAssignments } from '../../../mutate/matchUps/schedule/bulkUpdateCourtAssignments';
import { scheduleMatchUps } from '../../../mutate/matchUps/schedule/scheduleMatchUps/scheduleMatchUps';
import { generateBookings } from '../../../mutate/matchUps/schedule/schedulers/utils/generateBookings';
import { reorderUpcomingMatchUps } from '../../../mutate/matchUps/schedule/reorderUpcomingMatchUps';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';
import { bulkRescheduleMatchUps } from './bulkRescheduleMatchUps';
import { proAutoSchedule } from '../../../mutate/matchUps/schedule/schedulers/proScheduler/proAutoSchedule';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { matchUpScheduleChange } from './matchUpScheduleChange';
import { getMatchUpDailyLimits } from '../../../query/extensions/getMatchUpDailyLimits';
import { proConflicts } from '../../../mutate/matchUps/schedule/schedulers/proScheduler/proConflicts';
import {
  getSchedulingProfile,
  setSchedulingProfile,
} from './schedulingProfile/schedulingProfile';
import {
  addPersonRequests,
  getPersonRequests,
  modifyPersonRequests,
  removePersonRequests,
} from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests';

// relocated
import { validateSchedulingProfile } from '../../../validators/validateSchedulingProfile';
import { findMatchUpFormatTiming } from '../../../acquire/findMatchUpFormatTiming';
import { getMatchUpDependencies } from '../../../query/matchUps/getMatchUpDependencies';

import {
  addMatchUpScheduledDate,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
  addMatchUpScheduleItems,
  addMatchUpCourtOrder,
} from '../../../mutate/matchUps/schedule/scheduleItems';
import { removeEventMatchUpFormatTiming } from '../../../mutate/events/extensions/removeEventMatchUpFormatTiming';
import { removeMatchUpCourtAssignment } from '../../../mutate/matchUps/schedule/removeMatchUpCourtAssignment';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { getEventMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getEventMatchUpFormatTiming';
import { addMatchUpScheduledTime } from '../../../mutate/matchUps/schedule/scheduledTime';
import { allocateTeamMatchUpCourts } from '../../../mutate/matchUps/schedule/allocateTeamMatchUpCourts';
import { assignMatchUpCourt } from '../../../mutate/matchUps/schedule/assignMatchUpCourt';
import { assignMatchUpVenue } from '../../../mutate/matchUps/schedule/assignMatchUpVenue';
import { modifyEventMatchUpFormatTiming } from '../../../mutate/events/extensions/modifyEventMatchUpFormatTiming';
import { addSchedulingProfileRound } from '../../../mutate/matchUps/schedule/addSchedulingProfileRound';
import { getProfileRounds } from '../../../query/matchUps/scheduling/getProfileRounds';
import { getRounds } from '../../../query/matchUps/scheduling/getRounds';
import { getScheduledRoundsDetails } from '../../../query/matchUps/scheduling/getScheduledRoundsDetails';
import { scheduleProfileRounds } from '../../../mutate/matchUps/schedule/scheduleProfileRounds';

const scheduleGovernor = {
  scheduleMatchUps,
  scheduleProfileRounds,
  clearScheduledMatchUps,
  bulkRescheduleMatchUps,
  getScheduledRoundsDetails,
  getMatchUpDependencies,
  generateVirtualCourts,
  generateBookings,

  proAutoSchedule,
  proConflicts,

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
