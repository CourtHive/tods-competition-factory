import { matchUpActions } from './matchUpActions';
import {
  calcTieMatchUpScore, matchUpDuration, getMatchUpScheduleDetails
} from 'competitionFactory/drawEngine/accessors/matchUpAccessor';

import { positionActions, getNextUnfilledDrawPositions } from './positionActions';

import { findStructure } from 'competitionFactory/drawEngine/getters/structureGetter';
import { getAllStructureMatchUps } from 'competitionFactory/drawEngine/getters/getMatchUps';
import { getMatchUpParticipantIds } from 'competitionFactory/drawEngine/accessors/participantAccessor';
import { getAllDrawMatchUps, getDrawMatchUps } from 'competitionFactory/drawEngine/getters/getMatchUps';

/*
  return an array of all matchUps within a drawDefinition
  inContext both adds drawId and structureId to matchUps
  AND deep copies so that changes cannot be made to drawDefinition
*/
function drawMatchUps(props) {
  Object.assign(props, { inContext: true });
  return getDrawMatchUps(props);
}

function allStructureMatchUps(props) {
  const { structure } = findStructure(props);
  Object.assign(props, { structure, inContext: true });
  return getAllStructureMatchUps(props);
}

function allDrawMatchUps(props) {
  Object.assign(props, { inContext: true });
  return getAllDrawMatchUps(props);
}

const queryGovernor = {
  allStructureMatchUps,
  allDrawMatchUps,
  drawMatchUps,

  matchUpActions,
  positionActions,
  getNextUnfilledDrawPositions,

  getMatchUpParticipantIds,
  getMatchUpScheduleDetails,
 
  calcTieMatchUpScore,
  matchUpDuration,
};

export default queryGovernor;
