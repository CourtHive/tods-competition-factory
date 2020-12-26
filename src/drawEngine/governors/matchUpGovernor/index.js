import { setMatchUpStatus } from './matchUpStatus';
import { setMatchUpFormat } from './matchUpFormat';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
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
  addMatchUpOfficial,
} from './scheduleItems';

const matchUpGovernor = {
  setMatchUpStatus,
  setMatchUpFormat,

  addMatchUpTimeItem,
  resetMatchUpTimeItems,
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

  findMatchUp: publicFindMatchUp,
  getRoundMatchUps: publicGetRoundMatchUps,

  validDrawPositions,
};

export default matchUpGovernor;
