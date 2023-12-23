import { getAllStructureMatchUps } from '../../../query/matchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter/getAllDrawMatchUps';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';

import { MatchUp } from '../../../types/tournamentTypes';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  COMPLETED,
  IN_PROGRESS,
} from '../../../constants/matchUpStatusConstants';

export function getTargetTeamMatchUps({
  updateInProgressMatchUps,
  drawDefinition,
  structureId,
  structure,
  matchUpId,
  matchUp,
}) {
  let matchUps: MatchUp[] = [];
  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps =
      getAllStructureMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        structure,
      })?.matchUps ?? [];
  } else if (drawDefinition) {
    matchUps =
      allDrawMatchUps({
        matchUpFilters: { matchUpTypes: [TEAM] },
        drawDefinition,
      })?.matchUps ?? [];
  }

  // all team matchUps in scope which are completed or which have a tieFormat should not be modified
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      !matchUp.winningSide &&
      matchUp.matchUpStatus !== COMPLETED &&
      (updateInProgressMatchUps ||
        (matchUp.matchUpStatus !== IN_PROGRESS && !checkScoreHasValue(matchUp)))
  );

  return { targetMatchUps };
}
