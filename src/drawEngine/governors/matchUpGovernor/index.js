import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { publicFindMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addFinishingRounds } from '../../generators/addFinishingRounds';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
import { removeDelegatedOutcome } from './removeDelegatedOutcome';
import { drawMatic } from '../../generators/drawMatic/drawMatic';
import { setDelegatedOutcome } from './setDelegatedOutcome';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { validDrawPositions } from './validDrawPositions';
import { disableTieAutoCalc } from './disableTieAutoCalc';
import { matchUpSort } from '../../getters/matchUpSort';
import { enableTieAutoCalc } from './enableTieAutoCalc';
import { setMatchUpStatus } from './setMatchUpStatus';
import { setOrderOfFinish } from './setOrderOfFinish';
import { setMatchUpFormat } from './setMatchUpFormat';
import { resetScorecard } from './resetScorecard';

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
  resetScorecard,
  setMatchUpStatus,
  setMatchUpFormat,
  updateTieMatchUpScore,
  isValidMatchUpFormat: isValid,

  disableTieAutoCalc,
  enableTieAutoCalc,

  addFinishingRounds,
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
