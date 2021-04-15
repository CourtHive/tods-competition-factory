import { assignMatchUpCourt } from './assignMatchUpCourt';
import { assignMatchUpVenue } from './assignMatchUpVenue';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
import { bulkScheduleMatchUps } from './bulkScheduleMatchUps';
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

const scheduleGovernor = {
  assignMatchUpCourt,
  assignMatchUpVenue,

  addMatchUpScheduleItems,
  addMatchUpScheduledDate,
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
