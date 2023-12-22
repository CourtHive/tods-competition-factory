import { getMatchUpFormatTimingUpdate } from '../../../query/extensions/matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { getScheduledRoundsDetails } from './schedulingProfile/getScheduledRoundsDetails';
import { calculateScheduleTimes } from './scheduleMatchUps/calculateScheduleTimes';
import { scheduleProfileRounds } from './schedulingProfile/scheduleProfileRounds';
import { generateVirtualCourts } from './schedulers/utils/generateVirtualCourts';
import { getMatchUpDailyLimitsUpdate } from '../../../query/extensions/getMatchUpDailyLimitsUpdate';
import { bulkUpdateCourtAssignments } from '../../../mutate/matchUps/schedule/bulkUpdateCourtAssignments';
import { scheduleMatchUps } from './scheduleMatchUps/scheduleMatchUps';
import { generateBookings } from './schedulers/utils/generateBookings';
import { reorderUpcomingMatchUps } from '../../../mutate/matchUps/schedule/reorderUpcomingMatchUps';
import { getProfileRounds } from './schedulingProfile/getProfileRounds';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';
import { bulkRescheduleMatchUps } from './bulkRescheduleMatchUps';
import { proAutoSchedule } from './proScheduling/proAutoSchedule';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { matchUpScheduleChange } from './matchUpScheduleChange';
import { getMatchUpDailyLimits } from '../../../query/extensions/getMatchUpDailyLimits';
import { proConflicts } from './proScheduling/proConflicts';
import { getRounds } from './schedulingProfile/getRounds';
import {
  addSchedulingProfileRound,
  getSchedulingProfile,
  setSchedulingProfile,
} from './schedulingProfile/schedulingProfile';
import {
  addPersonRequests,
  getPersonRequests,
  modifyPersonRequests,
  removePersonRequests,
} from './scheduleMatchUps/personRequests';

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
