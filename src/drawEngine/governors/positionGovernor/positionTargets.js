import { nextRoundMatchUp } from '../../getters/getMatchUps/nextRoundMatchUp';
import { getTargetMatchUp } from '../../getters/getMatchUps/getTargetMatchUp';
import { getRoundLinks, getTargetLink } from '../../getters/linkGetter';
import { findStructure } from '../../getters/findStructure';

import {
  LOSER,
  WINNER,
  ROUND_OUTCOME,
} from '../../../constants/drawDefinitionConstants';
import { getDevContext } from '../../../global/state/globalState';

/**
 * @param {string} matchUpId - matchUp identifier for sourceMatchUp
 * @param {object} structure - structure within which matchUp occurs
 * @param {object} drawDefinition - drawDefinition within which structure occurs
 * @param {object[]} inContextDrawMatchUps - array of all draw matchUps (for optimiation)
 * @param {object} inContextMatchUp - source matchUp with context
 * @param {boolean} useTargetMatchUpIds - whether to use { loserMatchUpId, winnerMatchUpId } to find targets
 *
 * targetMatchUpIds are used for optimization when fetching targetMatchUps for the purpose of displaying upcoming scheduling information
 * (!!) when targetMatchUpIds are used targetDrawPositions are not retrieved (!!)
 * targetDrawPositions are necessary for participant movement logic
 */
export function positionTargets({
  useTargetMatchUpIds = getDevContext({ useTargetMatchUpIds: true }),
  // useTargetMatchUpIds = true,
  inContextDrawMatchUps = [],
  inContextMatchUp,
  drawDefinition,
  matchUpId,
}) {
  let matchUp = inContextMatchUp;
  if (inContextDrawMatchUps.length && !matchUp) {
    matchUp = inContextDrawMatchUps.find((m) => m.matchUpId === matchUpId);
  }

  const { structure } = findStructure({
    structureId: matchUp.structureId,
    drawDefinition,
  });

  const { finishingPosition } = structure;
  if (finishingPosition === ROUND_OUTCOME) {
    return targetByRoundOutcome({
      inContextDrawMatchUps,
      useTargetMatchUpIds,
      drawDefinition,
      structure,
      matchUp,
    });
  } else {
    return targetByWinRatio({ drawDefinition, matchUp, structure });
  }
}

function targetByRoundOutcome({
  inContextDrawMatchUps,
  useTargetMatchUpIds,
  drawDefinition,
  structure,
  matchUp,
}) {
  const {
    links: { source },
  } = getRoundLinks({
    roundNumber: matchUp.roundNumber,
    structureId: structure.structureId,
    drawDefinition,
  });
  const winnerTargetLink = getTargetLink({ source, linkType: WINNER });
  const loserTargetLink = getTargetLink({ source, linkType: LOSER });
  const { winnerMatchUpId, loserMatchUpId } = matchUp;

  let loserMatchUp, loserTargetDrawPosition, loserMatchUpDrawPositionIndex;
  let winnerMatchUp, winnerTargetDrawPosition, winnerMatchUpDrawPositionIndex;
  let structureMatchUps;

  let targetedLoserMatchUp, targetedWinnerMatchUp;

  if (useTargetMatchUpIds || getDevContext({ useTargetMatchUpIds: true })) {
    targetedWinnerMatchUp =
      winnerMatchUpId &&
      inContextDrawMatchUps.find(
        ({ matchUpId }) => matchUpId === winnerMatchUpId
      );
    targetedLoserMatchUp =
      loserMatchUpId &&
      inContextDrawMatchUps.find(
        ({ matchUpId }) => matchUpId === loserMatchUpId
      );
  }

  if (useTargetMatchUpIds) {
    console.log('boo');
    winnerMatchUp = targetedWinnerMatchUp;
    loserMatchUp = targetedLoserMatchUp;
  }

  const useBruteForce =
    (winnerTargetLink && !winnerMatchUp) || (loserTargetLink && !loserMatchUp);

  if (useBruteForce) {
    if (getDevContext({ qualifying: true })) {
      console.log({ useBruteForce });
    }
    const { roundPosition: sourceRoundPosition } = matchUp;
    structureMatchUps =
      structureMatchUps ||
      inContextDrawMatchUps.filter(
        (matchUp) => matchUp.structureId === structure.structureId
      );
    const sourceRoundMatchUpCount = structureMatchUps.reduce(
      (count, currentMatchUp) => {
        return currentMatchUp.roundNumber === matchUp.roundNumber &&
          !currentMatchUp.matchUpTieId // exclude tieMatchUps
          ? count + 1
          : count;
      },
      0
    );

    if (loserTargetLink) {
      ({
        matchUp: loserMatchUp,
        matchUpDrawPositionIndex: loserMatchUpDrawPositionIndex,
        targetDrawPosition: loserTargetDrawPosition,
      } = getTargetMatchUp({
        targetLink: loserTargetLink,
        sourceRoundMatchUpCount,
        inContextDrawMatchUps,
        sourceRoundPosition,
        drawDefinition,
      }));
    }

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
    }

    if (getDevContext({ qualifying: true })) {
      console.log(
        sourceRoundPosition,
        sourceRoundMatchUpCount,
        winnerTargetLink,
        winnerMatchUp
      );
    }
  }

  if (!winnerMatchUp) {
    // if there is no winnerTargetLink then find targetMatchUp in next round
    structureMatchUps =
      structureMatchUps ||
      inContextDrawMatchUps.filter(
        (matchUp) => matchUp.structureId === structure.structureId
      );
    if (getDevContext({ qualifying: true })) {
      console.log('no winner matcnUp', { matchUp, structureMatchUps });
    }
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
