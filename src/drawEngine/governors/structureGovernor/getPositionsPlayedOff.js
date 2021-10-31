import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { generateRange, numericSort } from '../../../utilities';
import { roundValues } from './structureUtils';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';

export function getPositionsPlayedOff({ drawDefinition }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const allFinishingPositionRanges = (drawDefinition.structures || [])
    .filter((structure) => structure.structureType !== QUALIFYING)
    .map(({ structureId }) => {
      const { roundProfile } = getStructureRoundProfile({
        drawDefinition,
        structureId,
      });
      return Object.values(roundProfile).map(roundValues).flat();
    })
    .flat();

  const positionsPlayedOff = allFinishingPositionRanges
    .filter((positionRange) => positionRange.length === 1)
    .sort(numericSort)
    .flat();

  const allRangeValues = allFinishingPositionRanges.flat();
  const minRangeValue = Math.min(...allRangeValues);
  const maxRangeValue = Math.max(...allRangeValues);
  const positionsNotPlayedOff = generateRange(
    minRangeValue,
    maxRangeValue + 1
  ).filter((position) => !positionsPlayedOff.includes(position));

  return { positionsNotPlayedOff, positionsPlayedOff };
}
