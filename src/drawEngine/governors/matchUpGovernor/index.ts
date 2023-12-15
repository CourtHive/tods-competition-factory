import { isValid } from '../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { publicFindDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { addFinishingRounds } from '../../generators/addFinishingRounds';
import { validateScore } from '../../../global/validation/validateScore';
import {
  addMatchUpTimeItem,
  resetMatchUpTimeItems,
} from '../../../mutate/matchUps/matchUpTimeItems';
import { removeDelegatedOutcome } from './removeDelegatedOutcome';
import { drawMatic } from '../../../assemblies/generators/drawDefinitions/drawMatic/drawMatic';
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
