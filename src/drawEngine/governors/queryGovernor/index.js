import { matchUpActions } from './matchUpActions';
import {
  calcTieMatchUpScore,
  matchUpDuration,
  getMatchUpScheduleDetails,
  getMatchUpContextIds,
} from '../../accessors/matchUpAccessor';

import {
  structureActions,
  isCompletedStructure,
  allPlayoffPositionsFilled,
} from './structureActions';
import {
  positionActions,
  getNextUnfilledDrawPositions,
} from './positionActions';

import {
  getRoundPresentationProfile,
  getAllStructureMatchUps,
  getStructureMatchUps,
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../getters/getMatchUps';

import { findStructure } from '../../getters/findStructure';
import { getParticipantIdMatchUps } from './participantIdMatchUps';
import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';

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
  getParticipantIdMatchUps,
  allPlayoffPositionsFilled,
  isCompletedStructure,
  getStructureMatchUps,
  allStructureMatchUps,
  allDrawMatchUps,
  drawMatchUps,

  structureActions,
  matchUpActions,
  positionActions,
  getStructureSeedAssignments,
  getNextUnfilledDrawPositions,

  getMatchUpContextIds,
  getMatchUpParticipantIds,
  getMatchUpScheduleDetails,
  getRoundPresentationProfile,

  calcTieMatchUpScore,
  matchUpDuration,
};

export default queryGovernor;
