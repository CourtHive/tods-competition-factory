import { getMatchUpLinks, getTargetLink } from '../../getters/linkGetter';
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
export function positionTargets({ drawDefinition, policies, matchUpId }) {
  const { matchUp, structure } = findMatchUp({
    policies,
    drawDefinition,
    matchUpId,
    inContext: true,
  });
  const { finishingPosition } = structure;
  if (finishingPosition === ROUND_OUTCOME) {
    return targetByRoundOutcome({
      drawDefinition,
      policies,
      matchUp,
      structure,
    });
  } else {
    return targetByWinRatio({ drawDefinition, policies, matchUp, structure });
  }
}

function targetByRoundOutcome({
  drawDefinition,
  policies,
  matchUp,
  structure,
}) {
  const {
    links: { source },
  } = getMatchUpLinks({ drawDefinition, matchUp });
  const { matchUps } = getAllStructureMatchUps({ drawDefinition, structure });
  const sourceRoundMatchUpCount = matchUps.reduce((count, currentMatchUp) => {
    return currentMatchUp.roundNumber === matchUp.roundNumber
      ? count + 1
      : count;
  }, 0);

  const sourceRoundPosition = matchUp.roundPosition;
  const loserTargetLink = getTargetLink({ source, subject: LOSER });
  const { matchUp: loserMatchUp } = getTargetMatchUp({
    policies,
    drawDefinition,
    sourceRoundPosition,
    sourceRoundMatchUpCount,
    targetLink: loserTargetLink,
  });

  let winnerMatchUp;
  const winnerTargetLink = getTargetLink({ source, subject: WINNER });
  if (winnerTargetLink) {
    ({ matchUp: winnerMatchUp } = getTargetMatchUp({
      policies,
      drawDefinition,
      sourceRoundPosition,
      sourceRoundMatchUpCount,
      targetLink: winnerTargetLink,
    }));
  } else {
    ({ matchUp: winnerMatchUp } = nextRoundMatchUp({
      policies,
      structure,
      matchUp,
    }));
  }

  return {
    matchUp,
    targetLinks: { loserTargetLink, winnerTargetLink }, // returned for testing
    targetMatchUps: { loserMatchUp, winnerMatchUp },
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
