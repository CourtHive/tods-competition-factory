import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { chunkArray, generateRange, numericSort } from '../../../utilities';
import { groupConsecutiveNumbers, unique } from '../../../utilities/arrays';
import { MatchUpsMap, getMappedStructureMatchUps } from './getMatchUpsMap';
import { getRangeString } from './getRangeString';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { DrawDefinition } from '../../../types/tournamentFromSchema';
import { RoundProfile } from '../../../types/factoryTypes';

type GetDrawPositionRangesArgs = {
  drawDefinition: DrawDefinition;
  roundProfile?: RoundProfile;
  matchUpsMap: MatchUpsMap;
  structureId: string;
};
export function getDrawPositionsRanges({
  drawDefinition,
  roundProfile,
  structureId,
  matchUpsMap,
}: GetDrawPositionRangesArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  if (!roundProfile) {
    const structureMatchUps = getMappedStructureMatchUps({
      matchUpsMap,
      structureId,
    });
    ({ roundProfile } = getRoundMatchUps({
      matchUps: structureMatchUps,
    }));

    if (!roundProfile) return { error: MISSING_VALUE };
  }

  const firstRoundFirstDrawPosition = Math.min(
    ...(roundProfile?.[1]?.drawPositions || [])
  );
  const firstRoundFirstDrawPositionOffset =
    (firstRoundFirstDrawPosition || 1) - 1;

  const roundNumbers = Object.keys(roundProfile);
  const drawPositionsRanges = Object.assign(
    {},
    ...(roundNumbers || []).map((roundNumber) => {
      const matchUpsCount = roundProfile?.[roundNumber]?.matchUpsCount;
      const firstRoundDrawPositions = roundProfile?.[1]?.drawPositions || [];
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
          const drawPositions = roundProfile?.[value]?.drawPositions ?? [];
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
