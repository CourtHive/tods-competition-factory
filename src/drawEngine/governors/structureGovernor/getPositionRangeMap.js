import { getAvailablePlayoffProfiles } from './getAvailablePlayoffProfiles';

import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
} from '../../../constants/errorConditionConstants';

export function getPositionRangeMap({
  playoffGroups,
  drawDefinition,
  structureId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (typeof structureId !== 'string' || !Array.isArray(playoffGroups)) {
    return { error: INVALID_VALUES };
  }

  const playoffGroupFinishingPostions = playoffGroups
    .map(({ finishingPositions }) => finishingPositions)
    .flat();

  const availablePlayoffProfiles = getAvailablePlayoffProfiles({
    drawDefinition,
    structureId,
  });

  const playoffFinishingPositionRanges =
    availablePlayoffProfiles.playoffFinishingPositionRanges?.filter((r) =>
      playoffGroupFinishingPostions.includes(r.finishingPosition)
    );

  const positionRangeMap = playoffFinishingPositionRanges?.reduce(
    (positionMap, positionDetail) => {
      positionMap[positionDetail.finishingPosition] = positionDetail;
      return positionMap;
    },
    {}
  );

  return { positionRangeMap };
}
