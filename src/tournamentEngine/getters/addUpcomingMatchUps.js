import { findStructure } from '../../drawEngine/getters/findStructure';
import { positionTargets } from '../../drawEngine/governors/positionGovernor/positionTargets';

import { BYE } from '../../constants/matchUpStatusConstants';

export function addUpcomingMatchUps({ drawDefinition, inContextDrawMatchUps }) {
  inContextDrawMatchUps.forEach((matchUp) => {
    const { matchUpId, structureId } = matchUp;
    const { structure } = findStructure({ drawDefinition, structureId });
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      inContextDrawMatchUps,
    });
    const { winnerMatchUp, loserMatchUp } = targetData.targetMatchUps;
    const winnerTo = getUpcomingInfo({ upcomingMatchUp: winnerMatchUp });
    const loserTo = getUpcomingInfo({ upcomingMatchUp: loserMatchUp });
    if (matchUp.matchUpStatus !== BYE && loserMatchUp?.matchUpStatus === BYE) {
      console.log({ loserTo });
    }
    Object.assign(matchUp, { winnerTo, loserTo });
  });
}

function getUpcomingInfo({ upcomingMatchUp } = {}) {
  if (!upcomingMatchUp) return;
  return (({
    matchUpId,
    structureId,
    schedule,
    roundNumber,
    roundPosition,
    structureName,
  }) => ({
    matchUpId,
    structureId,
    schedule,
    roundNumber,
    roundPosition,
    structureName,
  }))(upcomingMatchUp);
}
