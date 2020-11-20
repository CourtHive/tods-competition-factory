import { assignMatchUpCourt } from './assignMatchUpCourt';
import { removeMatchUpCourtAssignment } from './removeMatchUpCourtAssignment';
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
  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
  removeMatchUpCourtAssignment,
};

export default scheduleGovernor;
