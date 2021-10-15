import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';

export function getProjectedDualWinningWide({
  matchUp,
  winningSide,
  dualMatchUp,
  tieFormat,
}) {
  const existingTieMatchUpWinningSide = matchUp.winningSide;
  let sideAdjustments = [0, 0];
  if (winningSide === 1 && existingTieMatchUpWinningSide === 2) {
    sideAdjustments = [-1, 1];
  } else if (winningSide === 2 && existingTieMatchUpWinningSide === 1) {
    sideAdjustments = [1, -1];
  } else if (winningSide && !existingTieMatchUpWinningSide) {
    if (winningSide === 1) {
      sideAdjustments = [1, 0];
    } else {
      sideAdjustments = [0, 1];
    }
  } else if (existingTieMatchUpWinningSide && !winningSide) {
    if (existingTieMatchUpWinningSide === 1) {
      sideAdjustments = [-1, 0];
    } else {
      sideAdjustments = [0, -1];
    }
  }

  const { winningSide: projectedWinningSide } = generateTieMatchUpScore({
    matchUp: dualMatchUp,
    sideAdjustments,
    tieFormat,
  });

  return { projectedWinningSide };
}
