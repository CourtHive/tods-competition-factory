import { modifyMatchUpFormatTiming } from './matchUpFormatTiming/modifyMatchUpFormatTiming';
import { findMatchUpFormatTiming } from './matchUpFormatTiming/findMatchUpFormatTiming';
import { toggleParticipantCheckInState } from './toggleParticipantCheckInState';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { bulkUpdateCourtAssignments } from './bulkUpdateCourtAssignments';
import { reorderUpcomingMatchUps } from './reorderUpcomingMatchUps';
import { calculateScheduleTimes } from './calculateScheduleTimes';
import { matchUpScheduleChange } from './matchUpScheduleChange';
import { scheduleMatchUps } from './scheduleMatchUps';
// import { getDaySchedule } from './daySchedule';
// import { addTimeItem } from './timeItems';
import {
  addSchedulingProfileRound,
  getSchedulingProfile,
  isValidSchedulingProfile,
  setSchedulingProfile,
} from './schedulingProfile';

const scheduleGovernor = {
  // addTimeItem,
  // getDaySchedule,
  scheduleMatchUps,
  matchUpScheduleChange,
  calculateScheduleTimes,
  reorderUpcomingMatchUps,
  bulkUpdateCourtAssignments,
  removeMatchUpCourtAssignment,
  toggleParticipantCheckInState,

  findMatchUpFormatTiming,
  modifyMatchUpFormatTiming,

  getSchedulingProfile,
  setSchedulingProfile,
  isValidSchedulingProfile,
  addSchedulingProfileRound,
};

export default scheduleGovernor;
