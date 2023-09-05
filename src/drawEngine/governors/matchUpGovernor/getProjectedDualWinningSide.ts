import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { generateTieMatchUpScore } from '../../generators/tieMatchUpScore/generateTieMatchUpScore';
import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { MatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { HydratedMatchUp } from '../../../types/hydrated';
import { makeDeepCopy } from '../../../utilities';
import {
  DrawDefinition,
  Event,
  MatchUp,
  Structure,
  TieFormat,
} from '../../../types/tournamentFromSchema';

type GetProjectedDualWinningSideArgs = {
  drawDefinition?: DrawDefinition;
  dualMatchUp: HydratedMatchUp;
  matchUpsMap?: MatchUpsMap;
  matchUpStatus?: string;
  tieFormat?: TieFormat;
  structure?: Structure;
  winningSide?: number;
  matchUp: MatchUp;
  event?: Event;
  score?: any;
};
export function getProjectedDualWinningSide({
  drawDefinition,
  matchUpStatus,
  matchUpsMap,
  winningSide,
  dualMatchUp,
  tieFormat,
  structure,
  matchUp,
  event,
  score,
}: GetProjectedDualWinningSideArgs) {
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
    resolveTieFormat({ matchUp, structure, drawDefinition, event })?.tieFormat;

  const { winningSide: projectedWinningSide } = generateTieMatchUpScore({
    matchUp: projectedDualMatchUp,
    drawDefinition,
    matchUpsMap,
    structure,
    tieFormat,
    event,
  });

  return { projectedWinningSide };
}
