import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findStructure } from '../../getters/findStructure';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { WIN_RATIO } from '../../../constants/drawDefinitionConstants';

export function addUpcomingMatchUps({ drawDefinition, inContextDrawMatchUps }) {
  inContextDrawMatchUps.forEach((matchUp) => {
    const { matchUpId, structureId, drawPositions = [] } = matchUp;
    const { structure } = findStructure({ drawDefinition, structureId });
    if (structure?.finishingPosition === WIN_RATIO) {
      const { roundNumber } = matchUp;
      const nextRoundNumber = roundNumber && parseInt(roundNumber) + 1;
      const matchUps = structure.matchUps || [];
      const { roundMatchUps } = getRoundMatchUps({ matchUps });
      if (nextRoundNumber && roundMatchUps[nextRoundNumber]) {
        const sidesTo = drawPositions.sort().map((drawPosition, index) => {
          const nextRoundMatchUp = roundMatchUps[nextRoundNumber].find(
            (matchUp) => matchUp.drawPositions.includes(drawPosition)
          );
          return {
            matchUpId: nextRoundMatchUp?.matchUpId,
            roundNumber: nextRoundNumber,
            schedule: nextRoundMatchUp?.schedule,
            sideNumber: index + 1,
            structureName: structure.structureName,
          };
        });
        Object.assign(matchUp, { sidesTo });
      }
    } else {
      const targetData = positionTargets({
        matchUpId,
        structure,
        drawDefinition,
        inContextDrawMatchUps,
      });
      const { winnerMatchUp, loserMatchUp } = targetData.targetMatchUps;
      const winnerTo = getUpcomingInfo({ upcomingMatchUp: winnerMatchUp });
      let loserTo = getUpcomingInfo({ upcomingMatchUp: loserMatchUp });
      if (
        matchUp.matchUpStatus !== BYE &&
        loserMatchUp?.matchUpStatus === BYE
      ) {
        const { matchUp: nextMatchUp } =
          getNextToBePlayedMatchUp({
            matchUp: loserMatchUp,
            drawDefinition,
            inContextDrawMatchUps,
          }) || {};
        loserTo =
          (nextMatchUp && getUpcomingInfo({ upcomingMatchUp: nextMatchUp })) ||
          loserTo;
      }
      Object.assign(matchUp, { winnerTo, loserTo });
    }
  });
}

function getNextToBePlayedMatchUp({
  matchUp,
  drawDefinition,
  inContextDrawMatchUps,
}) {
  const { matchUpId, matchUpStatus, structureId } = matchUp || {};
  if (!matchUp || !structureId || matchUp?.matchUpStatus === TO_BE_PLAYED)
    return { matchUp };
  if (matchUpStatus === BYE) {
    const { structure } = findStructure({ drawDefinition, structureId });
    const targetData =
      structure &&
      positionTargets({
        matchUpId,
        structure,
        drawDefinition,
        inContextDrawMatchUps,
      });
    const { winnerMatchUp } = targetData?.targetMatchUps || {};
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
