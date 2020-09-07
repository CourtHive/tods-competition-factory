import { getMatchUpLinks, getTargetLink } from 'src/drawEngine/getters/linkGetter';
import { findMatchUp } from 'src/drawEngine/getters/getMatchUps';
import { nextRoundMatchUp } from 'src/drawEngine/getters/getMatchUps';
import { getTargetMatchUp } from 'src/drawEngine/getters/getMatchUps';
import { getAllStructureMatchUps } from 'src/drawEngine/getters/getMatchUps';

import {
  LOSER, WINNER, ROUND_OUTCOME
} from 'src/constants/drawDefinitionConstants';

/*
  positionTargets 
*/
export function positionTargets({drawDefinition, matchUpId}) {
  const { matchUp, structure } = findMatchUp({drawDefinition, matchUpId, inContext: true});
  const { finishingPosition } = structure;
  if (finishingPosition === ROUND_OUTCOME) {
    return targetByRoundOutcome({drawDefinition, matchUp, structure});
  } else {
    return targetByWinRatio({drawDefinition, matchUp, structure});
  }
}

function targetByRoundOutcome({drawDefinition, matchUp, structure}) {
  const { links: { source } } = getMatchUpLinks({drawDefinition, matchUp});
  const { matchUps } = getAllStructureMatchUps({structure});
  const sourceRoundMatchUpCount = matchUps.reduce((count, currentMatchUp) => {
    return currentMatchUp.roundNumber === matchUp.roundNumber ? count + 1 : count;
  }, 0);
 
  const sourceRoundPosition = matchUp.roundPosition;
  const loserTargetLink = getTargetLink({ source, subject: LOSER });
  const { matchUp: loserMatchUp } = getTargetMatchUp({
    drawDefinition,
    sourceRoundPosition,
    sourceRoundMatchUpCount,
    targetLink: loserTargetLink
  });

  let winnerMatchUp;
  const winnerTargetLink = getTargetLink({ source, subject: WINNER });
  if (winnerTargetLink) {
    ({ matchUp: winnerMatchUp } = getTargetMatchUp({
      drawDefinition,
      sourceRoundPosition,
      sourceRoundMatchUpCount,
      targetLink: winnerTargetLink
    }));
  } else {
    ({ matchUp: winnerMatchUp } = nextRoundMatchUp({ structure, matchUp }));
  }
  
  return {
    matchUp,
    targetLinks: { loserTargetLink, winnerTargetLink }, // returned for testing
    targetMatchUps: { loserMatchUp, winnerMatchUp }
  }; 
}

function targetByWinRatio({drawDefinition, matchUp, structure}) {
  return {
    matchUp,
    targetLinks: { loserTargetLink: undefined, winnerTargetLink: undefined }, // returned for testing
    targetMatchUps: { loserMatchUp: undefined, winnerMatchUp: undefined }
  }; 
}
