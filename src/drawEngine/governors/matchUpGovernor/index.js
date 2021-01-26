import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { publicFindMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { addMatchUpTimeItem, resetMatchUpTimeItems } from './timeItems';
import { validDrawPositions } from './validDrawPositions';
import { setMatchUpStatus } from './setMatchUpStatus';
import { setMatchUpFormat } from './matchUpFormat';

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
