import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { groupConsecutiveNumbers, unique } from '../../../utilities/arrays';
import { chunkArray, generateRange, numericSort } from '../../../utilities';
import { getMappedStructureMatchUps } from './getMatchUpsMap';
import { getRangeString } from './getRangeString';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../../constants/errorConditionConstants';

export function getDrawPositionsRanges({
  drawDefinition,
  structureId,
  matchUpsMap,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const structureMatchUps = getMappedStructureMatchUps({
    matchUpsMap,
    structureId,
  });
  const { roundProfile } = getRoundMatchUps({
    matchUps: structureMatchUps,
  });

  const firstRoundFirstDrawPosition = Math.min(
    ...(roundProfile[1]?.drawPositions || [])
  );
  const firstRoundFirstDrawPositionOffset =
    (firstRoundFirstDrawPosition || 1) - 1;

  const roundNumbers = Object.keys(roundProfile);
  const drawPositionsRanges = Object.assign(
    {},
    ...(roundNumbers || []).map((roundNumber) => {
      const { matchUpsCount } = roundProfile[roundNumber];
      const firstRoundDrawPositions = roundProfile[1]?.drawPositions || [];
      const firstRoundDrawPositionsChunks = chunkArray(
        firstRoundDrawPositions,
        firstRoundDrawPositions.length / matchUpsCount
      );
      const firstRoundDrawPositionsRanges =
        firstRoundDrawPositionsChunks.map(getRangeString);
      const firstRoundOffsetDrawPositionsRanges = firstRoundDrawPositionsChunks
        .map((drawPositions) => {
          return drawPositions.map(
            (drawPosition) => drawPosition - firstRoundFirstDrawPositionOffset
          );
        })
        .map(getRangeString);

      const currentRoundDrawPositionChunks = roundNumbers
        .map((value) => {
          if (value > roundNumber) return undefined;
          const { drawPositions } = roundProfile[value];
          return chunkArray(
            drawPositions,
            drawPositions.length / matchUpsCount
          );
        })
        .filter(Boolean);

      const possibleDrawPositions = generateRange(0, matchUpsCount)
        .map((index) => {
          return currentRoundDrawPositionChunks
            .map((chunk) => chunk[index])
            .flat()
            .filter(Boolean)
            .sort(numericSort);
        })
        .map((possible) => unique(possible));

      const drawPositionsRanges = possibleDrawPositions.map((possible) => {
        return groupConsecutiveNumbers(possible).map(getRangeString).join(', ');
      });

      const roundPositionsMap = Object.assign(
        {},
        ...generateRange(0, matchUpsCount).map((index) => {
          const roundPosition = index + 1;
          return {
            [roundPosition]: {
              firstRoundDrawPositionsRange:
                firstRoundDrawPositionsRanges[index],
              firstRoundOffsetDrawPositionsRange:
                firstRoundOffsetDrawPositionsRanges[index],
              possibleDrawPositions: possibleDrawPositions[index],
              drawPositionsRange: drawPositionsRanges[index],
            },
          };
        })
      );

      return { [roundNumber]: roundPositionsMap };
    })
  );

  return { drawPositionsRanges };
}
