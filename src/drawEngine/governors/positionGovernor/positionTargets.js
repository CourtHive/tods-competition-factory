import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
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
  mappedMatchUps,
  inContextDrawMatchUps,
  sourceMatchUpWinnerDrawPositionIndex,
}) {
  const { matchUp } = findMatchUp({
    drawDefinition,
    mappedMatchUps,
    matchUpId,
    inContext: true,
  });
  const { finishingPosition } = structure;
  if (finishingPosition === ROUND_OUTCOME) {
    return targetByRoundOutcome({
      sourceMatchUpWinnerDrawPositionIndex,
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
  sourceMatchUpWinnerDrawPositionIndex,
}) {
  const {
    links: { source },
  } = getRoundLinks({
    drawDefinition,
    roundNumber: matchUp.roundNumber,
    structureId: structure.structureId,
  });
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
  const loserTargetLink = getTargetLink({ source, subject: LOSER });
  const {
    matchUp: loserMatchUp,
    matchUpDrawPositionIndex: loserMatchUpDrawPositionIndex,
  } = getTargetMatchUp({
    drawDefinition,
    inContextDrawMatchUps,
    sourceRoundPosition,
    sourceRoundMatchUpCount,
    targetLink: loserTargetLink,
    sourceMatchUpWinnerDrawPositionIndex,
  });

  let winnerMatchUp, winnerMatchUpDrawPositionIndex;
  const winnerTargetLink = getTargetLink({ source, subject: WINNER });
  if (winnerTargetLink) {
    ({
      matchUp: winnerMatchUp,
      matchUpDrawPositionIndex: winnerMatchUpDrawPositionIndex,
    } = getTargetMatchUp({
      drawDefinition,
      inContextDrawMatchUps,
      sourceRoundPosition,
      sourceRoundMatchUpCount,
      targetLink: winnerTargetLink,
      sourceMatchUpWinnerDrawPositionIndex,
    }));
  } else {
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
      loserMatchUpDrawPositionIndex,
      winnerMatchUpDrawPositionIndex,
    },
  };
}

// function targetByWinRatio({ drawDefinition, matchUp, structure }) {
function targetByWinRatio({ matchUp }) {
  return {
    matchUp,
    targetLinks: { loserTargetLink: undefined, winnerTargetLink: undefined }, // returned for testing
    targetMatchUps: { loserMatchUp: undefined, winnerMatchUp: undefined },
  };
}
