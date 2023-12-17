import { getRoundMatchUps } from '../../../query/matchUps/getRoundMatchUps';
import { isValidMatchUpFormat } from '../../../validators/isValidMatchUpFormat';
import { publicFindDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { getCheckedInParticipantIds } from '../../../query/matchUp/getCheckedInParticipantIds';
import { addFinishingRounds } from '../../generators/addFinishingRounds';
import { validateScore } from '../../../validators/validateScore';
import {
  addMatchUpTimeItem,
  resetMatchUpTimeItems,
} from '../../../mutate/matchUps/timeItems/matchUpTimeItems';
import { removeDelegatedOutcome } from '../../../mutate/matchUps/extensions/removeDelegatedOutcome';
import { drawMatic } from '../../../assemblies/generators/drawDefinitions/drawMatic/drawMatic';
import { setDelegatedOutcome } from './setDelegatedOutcome';
import { updateTieMatchUpScore } from '../../../mutate/matchUps/score/tieMatchUpScore';
import { validDrawPositions } from './validDrawPositions';
import { disableTieAutoCalc } from '../../../mutate/matchUps/extensions/disableTieAutoCalc';
import { enableTieAutoCalc } from './enableTieAutoCalc';
import { setMatchUpStatus } from '../../../mutate/matchUps/matchUpStatus/setMatchUpStatus';
import { setOrderOfFinish } from './setOrderOfFinish';
import { setMatchUpFormat } from '../../../mutate/matchUps/matchUpFormat/setMatchUpFormat';
import { resetScorecard } from './resetScorecard';
import { addGoesTo } from './addGoesTo';

import {
  addMatchUpScheduledTime,
  addMatchUpTimeModifiers,
} from '../../../mutate/matchUps/schedule/scheduledTime';
import {
  addMatchUpScheduledDate,
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,
  addMatchUpOfficial,
  addMatchUpScheduleItems,
} from '../../../mutate/matchUps/schedule/scheduleItems';

const matchUpGovernor = {
  resetScorecard,
  setMatchUpStatus,
  setMatchUpFormat,
  updateTieMatchUpScore,
  isValidMatchUpFormat,

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
