import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { numericSort, unique } from '../../../utilities';
import { roundValueRanges } from './structureUtils';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

// NOTE: positionsNotPlayedOff is not accurate when structureIds are are provided
export function getPositionsPlayedOff({ drawDefinition, structureIds }) {
  if (structureIds && !Array.isArray(structureIds))
    return { error: INVALID_VALUES, context: { structureIds } };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  structureIds =
    structureIds ||
    (drawDefinition.structures || [])
      .filter((structure) => structure.structureType !== QUALIFYING)
      .map(({ structureId }) => structureId);

  const allFinishingPositionRanges = structureIds
    .map((structureId) => {
      const { roundProfile } = getStructureRoundProfile({
        drawDefinition,
        structureId,
      });
      return Object.values(roundProfile).map(roundValueRanges).flat();
    })
    .flat();

  const positionsPlayedOff = allFinishingPositionRanges
    .filter((positionRange) => positionRange.length === 1)
    .sort(numericSort)
    .flat();

  const allRangeValues = unique(allFinishingPositionRanges.flat());
  const positionsNotPlayedOff = allRangeValues.filter(
    (position) => !positionsPlayedOff.includes(position)
  );

  return {
    positionsNotPlayedOff,
    positionsPlayedOff,
  };
}
