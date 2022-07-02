import { getAllStructureMatchUps } from '../../../drawEngine/getters/getMatchUps/getAllStructureMatchUps';
import { allDrawMatchUps } from '../../../tournamentEngine/getters/matchUpsGetter';
import { scoreHasValue } from '../scoreGovernor/scoreHasValue';

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
  scoreHasValue;
  let matchUps = [];
  if (matchUpId && matchUp) {
    matchUps = [matchUp];
  } else if (structureId && structure) {
    matchUps = getAllStructureMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      // inContext: false,
      structure,
    })?.matchUps;
  } else if (drawDefinition) {
    matchUps = allDrawMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM] },
      // inContext: false,
      drawDefinition,
    })?.matchUps;
  }

  // all team matchUps in scope which are completed or which have a tieFormat should not be modified
  const targetMatchUps = matchUps.filter(
    (matchUp) =>
      !matchUp.winningSide &&
      matchUp.matchUpStatus !== COMPLETED &&
      (updateInProgressMatchUps ||
        (matchUp.matchUpStatus !== IN_PROGRESS && !scoreHasValue(matchUp)))
  );

  return { targetMatchUps };
}
