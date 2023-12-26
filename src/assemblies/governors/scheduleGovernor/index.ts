import { getMatchUpDependencies } from '../../../query/matchUps/getMatchUpDependencies';
import { modifyEventMatchUpFormatTiming } from '../../../mutate/events/extensions/modifyEventMatchUpFormatTiming';
import { removeEventMatchUpFormatTiming } from '../../../mutate/events/extensions/removeEventMatchUpFormatTiming';
import { getMatchUpFormatTimingUpdate } from '../../../query/extensions/matchUpFormatTiming/getMatchUpFormatTimingUpdate';
import { validateSchedulingProfile } from '../../../validators/validateSchedulingProfile';
import { getModifiedMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getModifiedMatchUpTiming';
import { getEventMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getEventMatchUpFormatTiming';
import { modifyMatchUpFormatTiming } from '../../../mutate/matchUps/extensions/modifyMatchUpFormatTiming';
import { getMatchUpFormatTiming } from '../../../query/extensions/matchUpFormatTiming/getMatchUpFormatTiming';
import { removeMatchUpCourtAssignment } from '../../../mutate/matchUps/schedule/removeMatchUpCourtAssignment';
import { allocateTeamMatchUpCourts } from '../../../mutate/matchUps/schedule/allocateTeamMatchUpCourts';
import { clearMatchUpSchedule } from '../../../mutate/matchUps/schedule/clearMatchUpSchedule';
import { bulkScheduleTournamentMatchUps } from '../../../mutate/matchUps/schedule/bulkScheduleTournamentMatchUps';
import { assignMatchUpCourt } from '../../../mutate/matchUps/schedule/assignMatchUpCourt';
import { assignMatchUpVenue } from '../../../mutate/matchUps/schedule/assignMatchUpVenue';
import { addMatchUpScheduledTime } from '../../../mutate/matchUps/schedule/scheduledTime';
import { getMatchUpDailyLimits } from '../../../query/extensions/getMatchUpDailyLimits';
import { setMatchUpDailyLimits } from '../../../mutate/tournaments/setMatchUpDailyLimits';
import { bulkRescheduleMatchUps } from '../../../mutate/matchUps/schedule/bulkRescheduleMatchUps';
import { clearScheduledMatchUps } from '../../../mutate/matchUps/schedule/clearScheduledMatchUps';

import { calculateScheduleTimes } from '../../../mutate/matchUps/schedule/scheduleMatchUps/calculateScheduleTimes';
import { generateVirtualCourts } from '../../../mutate/matchUps/schedule/schedulers/utils/generateVirtualCourts';
import { getMatchUpDailyLimitsUpdate } from '../../../query/extensions/getMatchUpDailyLimitsUpdate';
import { bulkUpdateCourtAssignments } from '../../../mutate/matchUps/schedule/bulkUpdateCourtAssignments';
import { scheduleMatchUps } from '../../../mutate/matchUps/schedule/scheduleMatchUps/scheduleMatchUps';
import { generateBookings } from '../../../mutate/matchUps/schedule/schedulers/utils/generateBookings';
import { reorderUpcomingMatchUps } from '../../../mutate/matchUps/schedule/reorderUpcomingMatchUps';
import { proAutoSchedule } from '../../../mutate/matchUps/schedule/schedulers/proScheduler/proAutoSchedule';
import { matchUpScheduleChange } from '../../../mutate/matchUps/schedule/matchUpScheduleChange';
import { proConflicts } from '../../../mutate/matchUps/schedule/schedulers/proScheduler/proConflicts';
import { findMatchUpFormatTiming } from '../../../acquire/findMatchUpFormatTiming';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { addSchedulingProfileRound } from '../../../mutate/matchUps/schedule/addSchedulingProfileRound';
import { getProfileRounds } from '../../../query/matchUps/scheduling/getProfileRounds';
import { getRounds } from '../../../query/matchUps/scheduling/getRounds';
import { getScheduledRoundsDetails } from '../../../query/matchUps/scheduling/getScheduledRoundsDetails';
import { scheduleProfileRounds } from '../../../mutate/matchUps/schedule/scheduleProfileRounds';

import { modifyPersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/modifyPersonRequests';
import { removePersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/removePersonRequests';
import { addPersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/addPersonRequests';
import { getPersonRequests } from '../../../query/matchUps/scheduling/getPersonRequests';

import {
  addMatchUpCourtOrder,
  addMatchUpScheduledDate,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
  addMatchUpScheduleItems,
} from '../../../mutate/matchUps/schedule/scheduleItems';
import {
  getSchedulingProfile,
  setSchedulingProfile,
} from '../../../mutate/tournaments/schedulingProfile';

const scheduleGovernor = {
  addMatchUpCourtOrder,
  addMatchUpEndTime,
  addMatchUpOfficial,
  addMatchUpResumeTime,
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpScheduleItems,
  addMatchUpStartTime,
  addMatchUpStopTime,
  addPersonRequests,
  addSchedulingProfileRound,
  allocateTeamMatchUpCourts,
  assignMatchUpCourt,
  assignMatchUpVenue,
  bulkRescheduleMatchUps,
  bulkScheduleTournamentMatchUps,
  bulkUpdateCourtAssignments,
  calculateScheduleTimes,
  clearMatchUpSchedule,
  clearScheduledMatchUps,
  findMatchUpFormatTiming,
  generateBookings,
  generateVirtualCourts,
  getEventMatchUpFormatTiming,
  getMatchUpDailyLimits, // document
  getMatchUpDailyLimitsUpdate, // document
  getMatchUpDependencies,
  getMatchUpFormatTiming,
  getMatchUpFormatTimingUpdate,
  getModifiedMatchUpFormatTiming,
  getPersonRequests,
  getProfileRounds,
  getRounds,
  getScheduledRoundsDetails,
  getSchedulingProfile,
  matchUpScheduleChange,
  modifyEventMatchUpFormatTiming,
  modifyMatchUpFormatTiming,
  modifyPersonRequests,
  proAutoSchedule,
  proConflicts,
  removeEventMatchUpFormatTiming,
  removeMatchUpCourtAssignment,
  removePersonRequests,
  reorderUpcomingMatchUps,
  scheduleMatchUps,
  scheduleProfileRounds,
  setMatchUpDailyLimits, // document
  setSchedulingProfile,
  toggleParticipantCheckInState,
  validateSchedulingProfile,
};

export default scheduleGovernor;
