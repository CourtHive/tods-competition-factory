import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { isPowerOf2 } from '../../../utilities';

import { LUCKY_DRAW } from '../../../constants/drawDefinitionConstants';

export function isLucky({ drawDefinition, structure }) {
  if (!structure) return false;

  const { roundProfile, roundMatchUps } = getRoundMatchUps({
    matchUps: structure.matchUps || [],
  });

  const hasFirstRoundDrawPositions = !!roundMatchUps?.[1]?.find(
    ({ drawPositions }) => drawPositions
  );

  const noSecondRoundDrawPositions = !roundMatchUps?.[2]?.find(
    ({ drawPositions }) => drawPositions
  );

  const hasOddMatchUpsCount = Object.values(roundProfile).find(
    ({ matchUpsCount }) => !isPowerOf2(matchUpsCount)
  );

  return (
    hasOddMatchUpsCount &&
    !structure?.structures &&
    hasFirstRoundDrawPositions &&
    noSecondRoundDrawPositions &&
    !(drawDefinition?.drawType && drawDefinition.drawType !== LUCKY_DRAW)
  );
}
