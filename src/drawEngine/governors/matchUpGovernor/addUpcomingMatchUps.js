import { findStructure } from '../../getters/findStructure';
import { positionTargets } from '../positionGovernor/positionTargets';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

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
    let loserTo = getUpcomingInfo({ upcomingMatchUp: loserMatchUp });
    if (matchUp.matchUpStatus !== BYE && loserMatchUp?.matchUpStatus === BYE) {
      const { matchUp: nextMatchUp } = getNextToBePlayedMatchUp({
        matchUp: loserMatchUp,
        drawDefinition,
        structure,
        inContextDrawMatchUps,
      });
      loserTo =
        nextMatchUp && getUpcomingInfo({ upcomingMatchUp: nextMatchUp });
    }
    Object.assign(matchUp, { winnerTo, loserTo });
  });
}

function getNextToBePlayedMatchUp({
  matchUp,
  drawDefinition,
  inContextDrawMatchUps,
}) {
  const { matchUpId, matchUpStatus, structureId } = matchUp || {};
  if (!matchUp || matchUp?.matchUpStatus === TO_BE_PLAYED) return { matchUp };
  if (matchUpStatus === BYE) {
    const { structure } = findStructure({ drawDefinition, structureId });
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      inContextDrawMatchUps,
    });
    const { winnerMatchUp } = targetData.targetMatchUps;
    return getNextToBePlayedMatchUp({
      matchUp: winnerMatchUp,
      drawDefinition,
      inContextDrawMatchUps,
    });
  }
  return { matchUp: undefined };
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
