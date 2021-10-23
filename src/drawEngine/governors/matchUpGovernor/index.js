import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { publicFindMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
import { isValid } from '../scoreGovernor/matchUpFormatCode/isValid';
import { removeDelegatedOutcome } from './removeDelegatedOutcome';
import { drawMatic } from '../../generators/drawMatic/drawMatic';
import { setDelegatedOutcome } from './setDelegatedOutcome';
import { validDrawPositions } from './validDrawPositions';
import { matchUpSort } from '../../getters/matchUpSort';
import { setMatchUpStatus } from './setMatchUpStatus';
import { setOrderOfFinish } from './setOrderOfFinish';
import { setMatchUpFormat } from './matchUpFormat';

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

const matchUpGovernor = {
  setMatchUpStatus,
  setMatchUpFormat,
  isValidMatchUpFormat: isValid,

  addMatchUpTimeItem,
  resetMatchUpTimeItems,
  checkInParticipant,
  checkOutParticipant,
  getCheckedInParticipantIds,

  addMatchUpScheduleItems,
  addMatchUpScheduledDate,
  addMatchUpScheduledTime,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,

  setOrderOfFinish,
  setDelegatedOutcome,
  removeDelegatedOutcome,

  drawMatic,
  matchUpSort,
  addMatchUpOfficial,

  findMatchUp: publicFindMatchUp,
  getRoundMatchUps,

  validDrawPositions,
};

export default matchUpGovernor;
