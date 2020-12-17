import { assignMatchUpCourt } from './assignMatchUpCourt';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';
import {
  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
} from './scheduleItems';

const scheduleGovernor = {
  assignMatchUpCourt,
  assignMatchUpVenue,
  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,

  removeMatchUpCourtAssignment,

  bulkScheduleMatchUps,
};

export default scheduleGovernor;
