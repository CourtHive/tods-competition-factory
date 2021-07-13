import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getStructureLinks } from '../../getters/linkGetter';
import { findStructure, getDrawStructures } from '../../getters/findStructure';
import { getSourceRounds } from './getSourceRounds';

import {
  CONTAINER,
  FIRST_MATCHUP,
  MAIN,
} from '../../../constants/drawDefinitionConstants';
import {
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function getAvailablePlayoffRounds({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { structures } = getDrawStructures({
    drawDefinition,
    stage: MAIN,
    stageSeqence: 1,
  });
  // mainStructure is necessary to get the full range of finishingPositions
  const mainStructure = structures && structures[0];
  if (!mainStructure) return { error: STRUCTURE_NOT_FOUND };

  const positionAssignments = mainStructure.positionAssignments || [];
  const drawPositions = positionAssignments?.map(
    (assignment) => assignment.drawPosition
  );

  // positions which are being played off by existing structure(s)
  const { positionsPlayedOff } = getPositionsPlayedOff({ drawDefinition });

  // all positions which are NOT currently being played off
  const playoffPositions = drawPositions.filter(
    (drawPosition) => !positionsPlayedOff.includes(drawPosition)
  );

  ({ structures } = getDrawStructures({ drawDefinition }));
  const filteredStructures = structures.filter(
    (structure) => !structureId || structure.structureId === structureId
  );

  const available = {};
  for (const structure of filteredStructures) {
    const structureId = structure?.structureId;
    const {
      playoffSourceRounds: playoffRounds,
      playoffRoundsRanges,
      error,
    } = getavailablePlayoffRounds({
      drawDefinition,
      playoffPositions,
      structureId,
    });
    if (error) return { error };

    available[structureId] = {
      structureId,
      playoffRounds,
      playoffRoundsRanges,
    };
  }

  if (structureId) {
    return { positionsPlayedOff, ...available[structureId] };
  } else {
    return {
      positionsPlayedOff,
      availablePlayoffRounds: Object.values(available),
    };
  }
}

function getavailablePlayoffRounds({
  drawDefinition,
  playoffPositions,
  structureId,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  if (structure.structureType === CONTAINER)
    return { playoffSourceRounds: [], playoffRoundsRanges: [] };

  const { links } = getStructureLinks({ drawDefinition, structureId });
  const linkSourceRoundNumbers =
    links?.source
      // TODO: perhaps this should be enabled by a policyDefinition
      ?.filter((link) => link.linkCondition !== FIRST_MATCHUP)
      .map((link) => link.source?.roundNumber) || [];

  return getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions,
    excludeRoundNumbers: linkSourceRoundNumbers,
  });
}
