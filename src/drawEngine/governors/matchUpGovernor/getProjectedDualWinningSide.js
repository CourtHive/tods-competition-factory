import { generateTieMatchUpScore } from '../../generators/generateTieMatchUpScore';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { makeDeepCopy } from '../../../utilities';

export function getProjectedDualWinningSide({
  drawDefinition,
  matchUpStatus,
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
      if (!scoreHasValue({ score }) && !matchUpStatus) {
        Object.assign(tieMatchUp, { ...toBePlayed });
      } else if (matchUpStatus) {
        tieMatchUp.matchUpStatus = matchUpStatus;
      }
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
    drawDefinition,
    tieFormat,
    event,
  });

  return { projectedWinningSide };
}
