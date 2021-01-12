import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { findStructure } from '../../getters/findStructure';
import { getPositionsPlayedOff } from './getPositionsPlayedOff';
import { getSourceRounds } from './getSourceRounds';

export function getAvailablePlayoffRounds({ drawDefinition, structureId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  // TODO: should this be valid for Round Robins?
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

  const { playoffSourceRounds, playoffRoundsRanges } = getSourceRounds({
    drawDefinition,
    structureId,
    playoffPositions,
  });

  return { playoffRounds: playoffSourceRounds, playoffRoundsRanges };
}
