import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { makeDeepCopy } from '../../../utilities';

export function getProjectedDualWinningSide({
  drawDefinition,
  winningSide,
  dualMatchUp,
  tieFormat,
  structure,
  matchUp,
  event,
  score,
}) {
  const projectedDualMatchUp = makeDeepCopy(dualMatchUp, undefined, true);
  for (const tieMatchUp of projectedDualMatchUp?.tieMatchUps || []) {
    if (tieMatchUp.matchUpId === matchUp.matchUpId) {
      tieMatchUp.winningSide = winningSide;
      tieMatchUp.score = score;
    }
  }

  tieFormat =
    tieFormat ||
    matchUp?.tieFormat ||
    structure?.tieFormat ||
    drawDefinition?.tieFormat ||
    event?.tieFormat;

  const { winningSide: projectedWinningSide } = generateTieMatchUpScore({
    matchUp: projectedDualMatchUp,
    tieFormat,
  });

  return { projectedWinningSide };
}
