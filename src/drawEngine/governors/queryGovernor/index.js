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

import { getStructureMatchUps } from '../../getters/getMatchUps/structureMatchUps';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../getters/getMatchUps/drawMatchUps';
import { getRoundPresentationProfile } from '../../getters/getMatchUps/getRoundPresentationProfile';

import { credits } from '../../../fixtures/credits';
import { findStructure } from '../../getters/findStructure';
import { getParticipantIdMatchUps } from './participantIdMatchUps';
import { positionActions } from './positionActions/positionActions';
import { getParticipantIdFinishingPositions } from './finishingPositions';
import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getNextUnfilledDrawPositions } from './positionActions/getNextUnfilledDrawPositions';

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
  allPlayoffPositionsFilled,
  isCompletedStructure,
  getStructureMatchUps,
  allStructureMatchUps,
  allDrawMatchUps,
  drawMatchUps,

  getParticipantIdMatchUps,
  getParticipantIdFinishingPositions,

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
  credits,
};

export default queryGovernor;
