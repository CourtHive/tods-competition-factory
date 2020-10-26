import { matchUpActions } from './matchUpActions';
import {
  calcTieMatchUpScore,
  matchUpDuration,
  getMatchUpScheduleDetails,
  getMatchUpContextIds,
} from '../../accessors/matchUpAccessor';

import { drawActions } from './drawActions';
import {
  positionActions,
  getNextUnfilledDrawPositions,
} from './positionActions';

import { findStructure } from '../../getters/findStructure';
import {
  getAllStructureMatchUps,
  getStructureMatchUps,
} from '../../getters/getMatchUps';
import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import { getAllDrawMatchUps, getDrawMatchUps } from '../../getters/getMatchUps';
import { getSeedAssignments } from '../../accessors/seedingAccessor';

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
  getStructureMatchUps,
  allStructureMatchUps,
  allDrawMatchUps,
  drawMatchUps,

  drawActions,
  matchUpActions,
  positionActions,
  getSeedAssignments,
  getNextUnfilledDrawPositions,

  getMatchUpContextIds,
  getMatchUpParticipantIds,
  getMatchUpScheduleDetails,

  calcTieMatchUpScore,
  matchUpDuration,
};

export default queryGovernor;
