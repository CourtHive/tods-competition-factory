import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { numericSort } from '../../../utilities';
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

  return { positionsPlayedOff };
}
