import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';

import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';

export function isLucky({
  hasOddMatchUpsCount,
  drawDefinition,
  roundMatchUps,
  structure,
}) {
  if (!structure) return false;

  if (!roundMatchUps) {
    ({ hasOddMatchUpsCount, roundMatchUps } = getRoundMatchUps({
      matchUps: structure.matchUps || [],
    }));
  }

  const hasFirstRoundDrawPositions = !!roundMatchUps?.[1]?.find(
    ({ drawPositions }) => drawPositions
  );

  const noSecondRoundDrawPositions = !roundMatchUps?.[2]?.find(
    ({ drawPositions }) => drawPositions
  );

  return (
    hasOddMatchUpsCount &&
    !structure?.structures &&
    hasFirstRoundDrawPositions &&
    noSecondRoundDrawPositions &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== LUCKY_DRAW)
  );
}
