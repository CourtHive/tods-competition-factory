import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { modifyMatchUpScore } from '../matchUpGovernor/modifyMatchUpScore';
import { findStructure } from '../../getters/findStructure';
import { intersection } from '../../../utilities';
import { positionTargets } from './positionTargets';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_POSITION_ASSIGNED,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';

export function doubleWalkoverAdvancement({
  drawDefinition,
  structure,
  targetData,

  matchUpsMap,
}) {
  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }
  const { matchUp: sourceMatchUp, targetMatchUps, targetLinks } = targetData;

  if (structure.structureType === CONTAINER) {
    return SUCCESS;
  }

  const { loserMatchUp, winnerMatchUp, loserTargetDrawPosition } =
    targetMatchUps;

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,

    matchUpsMap,
  });

  if (loserMatchUp) {
    const { loserTargetLink } = targetLinks;
    const result = advanceByeToLoserMatchUp({
      drawDefinition,
      loserMatchUp,
      loserTargetLink,
      loserTargetDrawPosition,

      matchUpsMap,
    });
    if (result.error) return result;
  }

  if (winnerMatchUp) {
    const result = conditionallyAdvanceDrawPosition({
      drawDefinition,
      structure,

      matchUpId: winnerMatchUp.matchUpId,
      sourceMatchUp,
      winnerMatchUp,
      inContextDrawMatchUps,

      matchUpsMap,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

function conditionallyAdvanceDrawPosition({
  drawDefinition,
  structure,

  matchUpId,
  sourceMatchUp,
  winnerMatchUp,
  inContextDrawMatchUps,

  matchUpsMap,
}) {
  const noContextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
  );
  if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };

  const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
  let targetDrawPositions = noContextWinnerMatchUp.drawPositions.filter(
    (f) => f
  );
  if (intersection(sourceDrawPositions, targetDrawPositions).length) {
    targetDrawPositions = targetDrawPositions.filter(
      (drawPosition) => !sourceDrawPositions.includes(drawPosition)
    );
  }

  if (targetDrawPositions.length > 1) {
    return { error: DRAW_POSITION_ASSIGNED };
  }
  const drawPositionToAdvance = targetDrawPositions[0];

  const targetData = positionTargets({
    matchUpId: winnerMatchUp.matchUpId,
    structure,
    drawDefinition,
    inContextDrawMatchUps,
  });
  const { targetMatchUps, targetLinks } = targetData;
  const {
    winnerMatchUp: nextWinnerMatchUp,
    loserMatchUp: nextLoserMatchUp,
    loserTargetDrawPosition: nextLoserTargetDrawPosition,
  } = targetMatchUps;

  if (nextWinnerMatchUp && drawPositionToAdvance) {
    const result = assignMatchUpDrawPosition({
      drawDefinition,
      matchUpId: nextWinnerMatchUp.matchUpId,
      drawPosition: drawPositionToAdvance,
    });
    if (result.error) console.log(result.error);
  } else {
    const previousRound =
      winnerMatchUp.roundNumber > 1 && winnerMatchUp.roundNumber - 1;
    if (previousRound && winnerMatchUp) {
      const sourceRoundPosition = sourceMatchUp?.roundPosition;
      const offset = sourceRoundPosition % 2 ? 1 : -1;
      const pairedRoundPosition = sourceRoundPosition + offset;
      const structureMatchUps = getMappedStructureMatchUps({
        structureId: structure.structureId,
        matchUpsMap,
      });
      const pairedPreviousMatchUp = structureMatchUps.find(
        ({ roundNumber, roundPosition }) =>
          roundNumber === previousRound && roundPosition === pairedRoundPosition
      );
      const pairedPreviousMatchUpStatus = pairedPreviousMatchUp?.matchUpStatus;
      if (pairedPreviousMatchUpStatus === DOUBLE_WALKOVER) {
        const noContextNextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
          (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
        );
        if (!noContextNextWinnerMatchUp) return { error: MISSING_MATCHUP };
        modifyMatchUpScore({
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUp: noContextNextWinnerMatchUp,
          drawDefinition,
          matchUpStatus: DOUBLE_WALKOVER,
          matchUpStatusCodes: [],
          removeScore: true,
        });
        doubleWalkoverAdvancement({
          drawDefinition,
          structure,
          targetData,
          matchUpId,
          matchUpsMap,
        });
      }
    }
  }

  if (nextLoserMatchUp) {
    const { loserTargetLink } = targetLinks;
    const result = advanceByeToLoserMatchUp({
      drawDefinition,
      loserMatchUp: nextLoserMatchUp,
      loserTargetLink,
      loserTargetDrawPosition: nextLoserTargetDrawPosition,
      matchUpsMap,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

function advanceByeToLoserMatchUp(params) {
  const {
    drawDefinition,
    loserTargetLink,
    loserTargetDrawPosition,
    matchUpsMap,
  } = params;
  const structureId = loserTargetLink?.target?.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: MISSING_STRUCTURE };

  return assignDrawPositionBye({
    drawDefinition,
    structureId,
    drawPosition: loserTargetDrawPosition,
    matchUpsMap,
  });
}
