import { setMatchUpStatus } from './matchUpStatus';
import { setMatchUpFormat } from './matchUpFormat';
import { addTimeItem, resetTimeItems } from './timeItems';
import { checkInParticipant, checkOutParticipant } from './checkInStatus';
import { getCheckedInParticipantIds } from '../../getters/matchUpTimeItems';

import { publicFindMatchUp, publicGetRoundMatchUps } from 'competitionFactory/drawEngine/getters/getMatchUps';

import {
  addMatchUpScheduledDayDate,
  addMatchUpScheduledTime,
  
  addMatchUpStartTime,
  addMatchUpEndTime,
  addMatchUpStopTime,
  addMatchUpResumeTime,

  assignMatchUpCourt,
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

  findMatchUp: publicFindMatchUp,
  getRoundMatchUps: publicGetRoundMatchUps,
};

export default matchUpGovernor;