import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { publicFindDrawMatchUp } from '../../getters/getMatchUps/findDrawMatchUp';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { addFinishingRounds } from '../../generators/addFinishingRounds';
import { validateScore } from '../../../global/validation/validateScore';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
import { removeDelegatedOutcome } from './removeDelegatedOutcome';
import { drawMatic } from '../../generators/drawMatic/drawMatic';
import { setDelegatedOutcome } from './setDelegatedOutcome';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { validDrawPositions } from './validDrawPositions';
import { disableTieAutoCalc } from './disableTieAutoCalc';
import { enableTieAutoCalc } from './enableTieAutoCalc';
import { setMatchUpStatus } from './setMatchUpStatus';
import { setOrderOfFinish } from './setOrderOfFinish';
import { setMatchUpFormat } from './setMatchUpFormat';
import { resetScorecard } from './resetScorecard';
import { addGoesTo } from './addGoesTo';

import {
  addMatchUpScheduledTime,
  addMatchUpTimeModifiers,
} from './scheduleTimeItems/scheduledTime';
import {
  addMatchUpScheduledDate,
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
  addMatchUpTimeModifiers,
  addGoesTo,

  setOrderOfFinish,
  setDelegatedOutcome,
  removeDelegatedOutcome,

  drawMatic,
  addMatchUpOfficial,

  findMatchUp: publicFindDrawMatchUp,
  getRoundMatchUps,

  validDrawPositions,
  validateScore,
};

export default matchUpGovernor;
