import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { publicFindMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
import { setDelegatedOutcome } from './setDelegatedOutcome';
import { validDrawPositions } from './validDrawPositions';
import { matchUpSort } from '../../getters/matchUpSort';
import { setMatchUpStatus } from './setMatchUpStatus';
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
import { removeDelegatedOutcome } from './removeDelegatedOutcome';

const matchUpGovernor = {
  setMatchUpStatus,
  setMatchUpFormat,

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

  setDelegatedOutcome,
  removeDelegatedOutcome,

  matchUpSort,
  addMatchUpOfficial,

  findMatchUp: publicFindMatchUp,
  getRoundMatchUps,

  validDrawPositions,
};

export default matchUpGovernor;
