import { getRoundLinks, getTargetLink } from '../../getters/linkGetter';
import { nextRoundMatchUp } from '../../getters/getMatchUps/nextRoundMatchUp';
import { getTargetMatchUp } from '../../getters/getMatchUps/getTargetMatchUp';

import {
  LOSER,
  WINNER,
  ROUND_OUTCOME,
} from '../../../constants/drawDefinitionConstants';

/*
  positionTargets 
*/
export function positionTargets({
  matchUpId,
  structure,
  drawDefinition,
  inContextDrawMatchUps = [],
  inContextMatchUp,
}) {
  let matchUp = inContextMatchUp;
  if (inContextDrawMatchUps.length && !matchUp) {
    matchUp = inContextDrawMatchUps.find((m) => m.matchUpId === matchUpId);
  }

  const { finishingPosition } = structure;
  if (finishingPosition === ROUND_OUTCOME) {
    return targetByRoundOutcome({
      drawDefinition,
      inContextDrawMatchUps,
      structure,
      matchUp,
    });
  } else {
    return targetByWinRatio({ drawDefinition, matchUp, structure });
  }
}

function targetByRoundOutcome({
  matchUp,
  structure,
  drawDefinition,
  inContextDrawMatchUps,
}) {
  const {
    links: { source },
  } = getRoundLinks({
    drawDefinition,
    roundNumber: matchUp.roundNumber,
    structureId: structure.structureId,
  });
  const winnerTargetLink = getTargetLink({ source, linkType: WINNER });
  const loserTargetLink = getTargetLink({ source, linkType: LOSER });

  const structureMatchUps = inContextDrawMatchUps.filter(
    (matchUp) => matchUp.structureId === structure.structureId
  );
  const sourceRoundMatchUpCount = structureMatchUps.reduce(
    (count, currentMatchUp) => {
      return currentMatchUp.roundNumber === matchUp.roundNumber
        ? count + 1
        : count;
    },
    0
  );

  const { roundPosition: sourceRoundPosition } = matchUp;
  const {
    matchUp: loserMatchUp,
    matchUpDrawPositionIndex: loserMatchUpDrawPositionIndex,
    targetDrawPosition: loserTargetDrawPosition,
  } = getTargetMatchUp({
    drawDefinition,
    inContextDrawMatchUps,
    sourceRoundPosition,
    sourceRoundMatchUpCount,
    targetLink: loserTargetLink,
  });

  let winnerMatchUp, winnerTargetDrawPosition, winnerMatchUpDrawPositionIndex;
  if (winnerTargetLink) {
    ({
      matchUp: winnerMatchUp,
      matchUpDrawPositionIndex: winnerMatchUpDrawPositionIndex,
      targetDrawPosition: winnerTargetDrawPosition,
    } = getTargetMatchUp({
      drawDefinition,
      inContextDrawMatchUps,
      sourceRoundPosition,
      sourceRoundMatchUpCount,
      targetLink: winnerTargetLink,
    }));
  } else {
    // if there is no winnerTargetLink then find targetMatchUp in next round
    ({ matchUp: winnerMatchUp } = nextRoundMatchUp({
      structureMatchUps,
      matchUp,
    }));
  }

  return {
    matchUp,
    targetLinks: { loserTargetLink, winnerTargetLink },
    targetMatchUps: {
      loserMatchUp,
      winnerMatchUp,
      loserTargetDrawPosition,
      winnerTargetDrawPosition,
      loserMatchUpDrawPositionIndex,
      winnerMatchUpDrawPositionIndex,
    },
  };
}

function targetByWinRatio({ matchUp }) {
  return {
    matchUp,
    targetLinks: { loserTargetLink: undefined, winnerTargetLink: undefined }, // returned for testing
    targetMatchUps: { loserMatchUp: undefined, winnerMatchUp: undefined },
  };
}
