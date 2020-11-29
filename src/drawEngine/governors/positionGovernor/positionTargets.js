import { getRoundLinks, getTargetLink } from '../../getters/linkGetter';
import { findMatchUp } from '../../getters/getMatchUps';
import { nextRoundMatchUp } from '../../getters/getMatchUps';
import { getTargetMatchUp } from '../../getters/getMatchUps';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';

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
  drawDefinition,
  sourceMatchUpWinnerDrawPositionIndex,
}) {
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  const { finishingPosition } = structure;
  if (finishingPosition === ROUND_OUTCOME) {
    return targetByRoundOutcome({
      sourceMatchUpWinnerDrawPositionIndex,
      drawDefinition,
      matchUp,
      structure,
    });
  } else {
    return targetByWinRatio({ drawDefinition, matchUp, structure });
  }
}

function targetByRoundOutcome({
  matchUp,
  structure,
  drawDefinition,
  sourceMatchUpWinnerDrawPositionIndex,
}) {
  const {
    links: { source },
  } = getRoundLinks({
    drawDefinition,
    roundNumber: matchUp.roundNumber,
    structureId: structure.structureId,
  });
  const { matchUps } = getAllStructureMatchUps({ drawDefinition, structure });
  const sourceRoundMatchUpCount = matchUps.reduce((count, currentMatchUp) => {
    return currentMatchUp.roundNumber === matchUp.roundNumber
      ? count + 1
      : count;
  }, 0);

  const { roundPosition: sourceRoundPosition } = matchUp;
  const loserTargetLink = getTargetLink({ source, subject: LOSER });
  const {
    matchUp: loserMatchUp,
    matchUpDrawPositionIndex: loserMatchUpDrawPositionIndex,
  } = getTargetMatchUp({
    drawDefinition,
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
      sourceRoundPosition,
      sourceRoundMatchUpCount,
      targetLink: winnerTargetLink,
      sourceMatchUpWinnerDrawPositionIndex,
    }));
  } else {
    ({ matchUp: winnerMatchUp } = nextRoundMatchUp({
      structure,
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
