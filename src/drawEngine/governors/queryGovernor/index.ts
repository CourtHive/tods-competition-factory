import { getEligibleVoluntaryConsolationParticipants } from './getEligibleVoluntaryConsolationParticipants';
import { generateTieMatchUpScore } from '../../../assemblies/generators/tieMatchUpScore/generateTieMatchUpScore';
import { getNextUnfilledDrawPositions } from './positionActions/getNextUnfilledDrawPositions';
import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { getStructureSeedAssignments } from '../../../query/structure/getStructureSeedAssignments';
import { getStructureMatchUps } from '../../../query/structure/getStructureMatchUps';
import { getMatchUpParticipantIds } from '../../../query/matchUp/getMatchUpParticipantIds';
import { getEliminationDrawSize } from '../../../query/participants/getEliminationDrawSize';
import { getParticipantIdFinishingPositions } from './finishingPositions';
import { positionActions } from './positionActions/positionActions';
import { getParticipantIdMatchUps } from './participantIdMatchUps';
import { getValidGroupSizes } from '../../../assemblies/generators/drawDefinitions/drawTypes/roundRobin/roundRobin';
import { findStructure } from '../../getters/findStructure';
import { credits } from '../../../fixtures/credits';
import { getExitProfiles } from './getExitProfile';
import { matchUpActions } from './matchUpActions';
import {
  getAllDrawMatchUps,
  getDrawMatchUps,
} from '../../../query/drawMatchUps';
import {
  getSeedBlocks,
  getSeedGroups,
  getSeedingThresholds,
} from '../positionGovernor/getSeedBlocks';

import {
  structureActions,
  isCompletedStructure,
  allPlayoffPositionsFilled,
} from './structureActions';
import { getMatchUpContextIds } from '../../../query/matchUp/getMatchUpContextIds';
import { getMatchUpScheduleDetails } from '../../../query/matchUp/getMatchUpScheduleDetails';
import { matchUpDuration } from '../../../query/matchUp/matchUpDuration';

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
  getAllStructureMatchUps,
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

  getValidGroupSizes,
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
