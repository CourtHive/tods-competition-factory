import { modifyPersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/modifyPersonRequests';
import { removePersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/removePersonRequests';
import { addPersonRequests } from '../../../mutate/matchUps/schedule/scheduleMatchUps/personRequests/addPersonRequests';
import { calculateScheduleTimes } from '../../../mutate/matchUps/schedule/scheduleMatchUps/calculateScheduleTimes';
import { modifyEventMatchUpFormatTiming } from '../../../mutate/events/extensions/modifyEventMatchUpFormatTiming';
import { removeEventMatchUpFormatTiming } from '../../../mutate/events/extensions/removeEventMatchUpFormatTiming';
import { bulkScheduleTournamentMatchUps } from '../../../mutate/matchUps/schedule/bulkScheduleTournamentMatchUps';
import { generateVirtualCourts } from '../../../mutate/matchUps/schedule/schedulers/utils/generateVirtualCourts';
import { toggleParticipantCheckInState } from '../../../mutate/matchUps/timeItems/toggleParticipantCheckInState';
import { removeMatchUpCourtAssignment } from '../../../mutate/matchUps/schedule/removeMatchUpCourtAssignment';
import { proAutoSchedule } from '../../../mutate/matchUps/schedule/schedulers/proScheduler/proAutoSchedule';
import { modifyMatchUpFormatTiming } from '../../../mutate/matchUps/extensions/modifyMatchUpFormatTiming';
import { bulkUpdateCourtAssignments } from '../../../mutate/matchUps/schedule/bulkUpdateCourtAssignments';
import { allocateTeamMatchUpCourts } from '../../../mutate/matchUps/schedule/allocateTeamMatchUpCourts';
import { scheduleMatchUps } from '../../../mutate/matchUps/schedule/scheduleMatchUps/scheduleMatchUps';
import { generateBookings } from '../../../mutate/matchUps/schedule/schedulers/utils/generateBookings';
import { addSchedulingProfileRound } from '../../../mutate/matchUps/schedule/addSchedulingProfileRound';
import { proConflicts } from '../../../mutate/matchUps/schedule/schedulers/proScheduler/proConflicts';
import { reorderUpcomingMatchUps } from '../../../mutate/matchUps/schedule/reorderUpcomingMatchUps';
import { bulkRescheduleMatchUps } from '../../../mutate/matchUps/schedule/bulkRescheduleMatchUps';
import { clearScheduledMatchUps } from '../../../mutate/matchUps/schedule/clearScheduledMatchUps';
import { matchUpScheduleChange } from '../../../mutate/matchUps/schedule/matchUpScheduleChange';
import { bulkScheduleMatchUps } from '../../../mutate/matchUps/schedule/bulkScheduleMatchUps';
import { scheduleProfileRounds } from '../../../mutate/matchUps/schedule/scheduleProfileRounds';
import { clearMatchUpSchedule } from '../../../mutate/matchUps/schedule/clearMatchUpSchedule';
import { addMatchUpScheduledTime } from '../../../mutate/matchUps/schedule/scheduledTime';
import { setMatchUpDailyLimits } from '../../../mutate/tournaments/setMatchUpDailyLimits';
import { assignMatchUpCourt } from '../../../mutate/matchUps/schedule/assignMatchUpCourt';
import { assignMatchUpVenue } from '../../../mutate/matchUps/schedule/assignMatchUpVenue';
import { validateSchedulingProfile } from '../../../validators/validateSchedulingProfile';
import { findMatchUpFormatTiming } from '../../../acquire/findMatchUpFormatTiming';
import { getProfileRounds } from '../../../mutate/matchUps/schedule/profileRounds';
import { courtGridRows } from '../../generators/scheduling/courtGridRows';
import { publicFindCourt } from '../../../mutate/venues/findCourt';
import { findVenue } from '../../../mutate/venues/findVenue';

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

export const scheduleGovernor = {
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
  bulkScheduleMatchUps,
  bulkScheduleTournamentMatchUps,
  bulkUpdateCourtAssignments,
  calculateScheduleTimes,
  clearMatchUpSchedule,
  clearScheduledMatchUps,
  courtGridRows,
  findCourt: publicFindCourt,
  findMatchUpFormatTiming,
  findVenue,
  generateBookings,
  generateVirtualCourts,
  getProfileRounds,
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
