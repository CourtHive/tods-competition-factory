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
import { getMatchUpDailyLimitsUpdate } from './getMatchUpDailyLimitsUpdate';
import { allocateTeamMatchUpCourts } from '../../../mutate/matchUps/schedule/allocateTeamMatchUpCourts';
import { bulkRescheduleMatchUps } from './bulkRescheduleMatchUps';
import { clearScheduledMatchUps } from './clearScheduledMatchUps';
import { setMatchUpDailyLimits } from './setMatchUpDailyLimits';
import { getMatchUpDailyLimits } from './getMatchUpDailyLimits';
import { clearMatchUpSchedule } from '../../../mutate/matchUps/schedule/clearMatchUpSchedule';
import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';
import { assignMatchUpCourt } from '../../../mutate/matchUps/schedule/assignMatchUpCourt';
import { assignMatchUpVenue } from '../../../mutate/matchUps/schedule/assignMatchUpVenue';
import { addMatchUpScheduledTime } from '../../../mutate/matchUps/schedule/scheduledTime';
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
} from './schedulingProfile';

const scheduleGovernor = {
  allocateTeamMatchUpCourts,
  addMatchUpCourtOrder,
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
