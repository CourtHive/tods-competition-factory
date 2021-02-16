import { getRoundMatchUps } from '../accessors/matchUpAccessor/getRoundMatchUps';
import { getInitialRoundNumber } from './getInitialRoundNumber';

// defaults to finding the paired drawPosition in the initial roundNumber in which the drawPosition occurs
// for feed-in rounds fed drawPositions will not initially have a paired drawPosition
export function getPairedDrawPosition({ matchUps, drawPosition, roundNumber }) {
  if (!matchUps) return {};
  const { roundProfile } = getRoundMatchUps({ matchUps }) || {};
  const { initialRoundNumber } = getInitialRoundNumber({
    matchUps,
    drawPosition,
  });

  const targetRoundProfile = roundProfile[roundNumber || initialRoundNumber];
  const pairedDrawPositions = targetRoundProfile?.pairedDrawPositions?.find(
    (pair) => pair.includes(drawPosition)
  );
  const pairedDrawPosition = pairedDrawPositions?.find(
    (currentPosition) => currentPosition !== drawPosition
  );

  return { pairedDrawPosition };
}
