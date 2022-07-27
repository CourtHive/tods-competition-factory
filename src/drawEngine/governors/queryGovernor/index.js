import { getEligibleVoluntaryConsolationParticipants } from './getEligibleVoluntaryConsolationParticipants';
import { getNextUnfilledDrawPositions } from './positionActions/getNextUnfilledDrawPositions';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getStructureSeedAssignments } from '../../getters/getStructureSeedAssignments';
import { getStructureMatchUps } from '../../getters/getMatchUps/getStructureMatchUps';
import { generateTieMatchUpScore } from '../../generators/generateTieMatchUpScore';
import { getMatchUpParticipantIds } from '../../accessors/participantAccessor';
import { getEliminationDrawSize } from '../../getters/getEliminationDrawSize';
import { getParticipantIdFinishingPositions } from './finishingPositions';
import { positionActions } from './positionActions/positionActions';
import { getParticipantIdMatchUps } from './participantIdMatchUps';
import {
  getSeedBlocks,
  getSeedGroups,
  getSeedingThresholds,
} from '../positionGovernor/getSeedBlocks';
import { findStructure } from '../../getters/findStructure';
import { credits } from '../../../fixtures/credits';
import { getExitProfiles } from './getExitProfile';
import { matchUpActions } from './matchUpActions';
import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../getters/getMatchUps/drawMatchUps';
import {
  matchUpDuration,
  getMatchUpScheduleDetails,
  getMatchUpContextIds,
} from '../../accessors/matchUpAccessor';
import {
  structureActions,
  isCompletedStructure,
  allPlayoffPositionsFilled,
} from './structureActions';

/*
  return an array of all matchUps within a drawDefinition
  inContext both adds drawId and structureId to matchUps
  AND deep copies so that changes cannot be made to drawDefinition
*/
function drawMatchUps(params) {
  Object.assign(params, { inContext: true });
  return getDrawMatchUps(params);
}

function allStructureMatchUps(params) {
  const { structure } = findStructure(params);
  Object.assign(params, { structure, inContext: true });
  return getAllStructureMatchUps(params);
}

function allDrawMatchUps(params) {
  Object.assign(params, { inContext: true });
  return getAllDrawMatchUps(params);
}

const queryGovernor = {
  allPlayoffPositionsFilled,
  isCompletedStructure,
  getStructureMatchUps,
  allStructureMatchUps,
  allDrawMatchUps,
  drawMatchUps,

  getEliminationDrawSize,
  getParticipantIdMatchUps,
  getParticipantIdFinishingPositions,
  getEligibleVoluntaryConsolationParticipants,

  structureActions,
  matchUpActions,
  positionActions,
  getStructureSeedAssignments,
  getNextUnfilledDrawPositions,
  getExitProfiles,

  getSeedingThresholds,
  getSeedBlocks,
  getSeedGroups,

  getMatchUpContextIds,
  getMatchUpParticipantIds,
  getMatchUpScheduleDetails,
  generateTieMatchUpScore,

  matchUpDuration,
  credits,
};

export default queryGovernor;
