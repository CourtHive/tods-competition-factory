import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getStructureLinks } from '../../getters/linkGetter';
import { findStructure } from '../../getters/findStructure';
import { getSourceRounds } from './getSourceRounds';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function getAvailablePlayoffRounds({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  if (structure.structureType === CONTAINER)
    return { playoffSourceRounds: [], playoffRoundsRanges: [] };

  const { positionAssignments } = structure;
  const drawPositions = positionAssignments?.map(
    (assignment) => assignment.drawPosition
  );

  const { positionsPlayedOff } = getPositionsPlayedOff({ drawDefinition });

  const playoffPositions = drawPositions.filter(
    (drawPosition) => !positionsPlayedOff.includes(drawPosition)
  );

  const { links } = getStructureLinks({ drawDefinition, structureId });
  const linkSourceRoundNumbers =
    links?.source?.map((link) => link.source?.roundNumber) || [];

  const { playoffSourceRounds, playoffRoundsRanges } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions,
    excludeRoundNumbers: linkSourceRoundNumbers,
  });

  return {
    playoffRounds: playoffSourceRounds,
    playoffRoundsRanges,
    positionsPlayedOff,
  };
}
