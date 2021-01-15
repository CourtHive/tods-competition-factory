import { setMatchUpFormat } from './matchUpFormat';
import { setMatchUpStatus } from './setMatchUpStatus';
import { validDrawPositions } from './validDrawPositions';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { publicFindMatchUp, getRoundMatchUps } from '../../getters/getMatchUps';

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
  getRoundMatchUps,

  validDrawPositions,
};

export default matchUpGovernor;
