import { setMatchUpStatus } from './matchUpStatus';
import { setMatchUpFormat } from './matchUpFormat';
import { addTimeItem, resetTimeItems } from './timeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { validDrawPositions } from './validDrawPositions';

import {
  publicFindMatchUp,
  publicGetRoundMatchUps,
} from '../../getters/getMatchUps';

import {
  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  assignMatchUpCourt,
  assignMatchUpVenue,
  addMatchUpOfficial,
} from './scheduleItems';

const matchUpGovernor = {
  setMatchUpStatus,
  setMatchUpFormat,

  addTimeItem,
  resetTimeItems,
  checkInParticipant,
  checkOutParticipant,
  getCheckedInParticipantIds,

  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,

  addMatchUpOfficial,
  assignMatchUpCourt,
  assignMatchUpVenue,

  findMatchUp: publicFindMatchUp,
  getRoundMatchUps: publicGetRoundMatchUps,

  validDrawPositions,
};

export default matchUpGovernor;
