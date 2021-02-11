import { getRoundMatchUps } from '../accessors/matchUpAccessor/getRoundMatchUps';
import { getInitialRoundNumber } from './getInitialRoundNumber';

// defaults to finding the paired drawPosition in the initial roundNumber in which the drawPosition occurs
// for feed-in rounds fed drawPositions will not initially have a paired drawPosition
export function getPairedDrawPosition({ matchUps, drawPosition, roundNumber }) {
  const { roundProfile } = (matchUps && getRoundMatchUps({ matchUps })) || {};
  if (!roundProfile[roundNumber]) return {};

  const { initialRoundNumber } = getInitialRoundNumber({
    matchUps,
    drawPosition,
  });

  const pairedDrawPositions = roundProfile[
    roundNumber || initialRoundNumber
  ].pairedDrawPositions.find((pair) => pair.includes(drawPosition));
  const pairedDrawPosition = pairedDrawPositions?.find(
    (currentPosition) => currentPosition !== drawPosition
  );

  return { pairedDrawPosition };
}
