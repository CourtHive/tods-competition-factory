import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getDrawStructures } from '../../getters/findStructure';
import { getStructureLinks } from '../../getters/linkGetter';
import { getSourceRounds } from './getSourceRounds';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import {
  CONTAINER,
  FIRST_MATCHUP,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

export function getAvailablePlayoffRounds({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  let { structures } = getDrawStructures({
    stageSeqence: 1,
    drawDefinition,
    stage: MAIN,
  });

  // positions which are being played off by existing structure(s)
  const { positionsNotPlayedOff, positionsPlayedOff } = getPositionsPlayedOff({
    drawDefinition,
  });

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
    } = avaialblePlayoffRounds({
      playoffPositions: positionsNotPlayedOff,
      drawDefinition,
      structure,
    });
    if (error) return { error };

    available[structureId] = {
      playoffRoundsRanges,
      playoffRounds,
      structureId,
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

function avaialblePlayoffRounds({
  playoffPositions,
  drawDefinition,
  structure,
}) {
  if (structure.structureType === CONTAINER)
    return { playoffSourceRounds: [], playoffRoundsRanges: [] };

  const structureId = structure?.structureId;
  const { links } = getStructureLinks({ drawDefinition, structureId });

  const linkSourceRoundNumbers =
    links?.source
      // TODO: perhaps this should be enabled by a policyDefinitions
      ?.filter((link) => link.linkCondition !== FIRST_MATCHUP)
      .map((link) => link.source?.roundNumber) || [];

  return getSourceRounds({
    excludeRoundNumbers: linkSourceRoundNumbers,
    playoffPositions,
    drawDefinition,
    structureId,
  });
}
