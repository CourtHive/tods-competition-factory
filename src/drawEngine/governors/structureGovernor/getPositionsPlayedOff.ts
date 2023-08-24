import { getStructureRoundProfile } from '../../getters/getMatchUps/getStructureRoundProfile';
import { numericSort, unique } from '../../../utilities';
import { roundValueRanges } from './structureUtils';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { DrawDefinition } from '../../../types/tournamentFromSchema';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

// NOTE: positionsNotPlayedOff may not be accurate when structureIds are are provided
type GetPositionsPlayedOff = {
  drawDefinition: DrawDefinition;
  structureIds?: string[];
};
export function getPositionsPlayedOff({
  drawDefinition,
  structureIds,
}: GetPositionsPlayedOff) {
  if (structureIds && !Array.isArray(structureIds))
    return { error: INVALID_VALUES, context: { structureIds } };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  structureIds =
    structureIds ||
    (drawDefinition.structures || [])
      .filter((structure) => structure.stage !== QUALIFYING)
      .map(({ structureId }) => structureId);

  const allFinishingPositionRanges = structureIds
    .map((structureId) => {
      const { roundProfile } = getStructureRoundProfile({
        drawDefinition,
        structureId,
      });
      const values = roundProfile && Object.values(roundProfile);
      return values?.map(roundValueRanges).flat();
    })
    .flat();

  const positionsPlayedOff = allFinishingPositionRanges
    .filter((positionRange) => positionRange?.length === 1)
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
