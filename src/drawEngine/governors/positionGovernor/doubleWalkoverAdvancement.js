import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import {
  getMappedStructureMatchUps,
  getMatchUpsMap,
} from '../../getters/getMatchUps/getMatchUpsMap';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../getters/findStructure';
import { intersection } from '../../../utilities';
import { positionTargets } from './positionTargets';

import {
  DRAW_POSITION_ASSIGNED,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';
import { modifyMatchUpScore } from '../matchUpGovernor/modifyMatchUpScore';

export function doubleWalkoverAdvancement({
  drawDefinition,
  structure,

  mappedMatchUps,
  targetData,
}) {
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });
  const { matchUp: sourceMatchUp, targetMatchUps, targetLinks } = targetData;

  if (structure.structureType === CONTAINER) {
    return SUCCESS;
  }

  const {
    loserMatchUp,
    winnerMatchUp,
    loserTargetDrawPosition,
  } = targetMatchUps;

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    mappedMatchUps,
    includeByeMatchUps: true,
  });

  if (loserMatchUp) {
    const { loserTargetLink } = targetLinks;
    const result = advanceByeToLoserMatchUp({
      drawDefinition,
      loserMatchUp,
      loserTargetLink,
      loserTargetDrawPosition,
      mappedMatchUps,
    });
    if (result.error) return result;
  }

  if (winnerMatchUp) {
    const result = conditionallyAdvanceDrawPosition({
      drawDefinition,
      structure,

      sourceMatchUp,
      mappedMatchUps,
      winnerMatchUp,
      inContextDrawMatchUps,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

function conditionallyAdvanceDrawPosition({
  drawDefinition,
  structure,

  sourceMatchUp,
  mappedMatchUps,
  winnerMatchUp,
  inContextDrawMatchUps,
}) {
  const { matchUp: noContextWinnerMatchUp } = findMatchUp({
    drawDefinition,
    mappedMatchUps,
    matchUpId: winnerMatchUp.matchUpId,
  });
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
        mappedMatchUps,
        structureId: structure.structureId,
      });
      const pairedPreviousMatchUp = structureMatchUps.find(
        ({ roundNumber, roundPosition }) =>
          roundNumber === previousRound && roundPosition === pairedRoundPosition
      );
      const pairedPreviousMatchUpStatus = pairedPreviousMatchUp?.matchUpStatus;
      if (pairedPreviousMatchUpStatus === DOUBLE_WALKOVER) {
        const { matchUp: noContextNextWinnerMatchUp } = findMatchUp({
          drawDefinition,
          mappedMatchUps,
          matchUpId: winnerMatchUp.matchUpId,
        });
        if (!noContextNextWinnerMatchUp) return { error: MISSING_MATCHUP };
        modifyMatchUpScore({
          matchUp: noContextNextWinnerMatchUp,
          drawDefinition,
          matchUpStatus: DOUBLE_WALKOVER,
          matchUpStatusCodes: [],
          removeScore: true,
        });
        doubleWalkoverAdvancement({
          drawDefinition,
          structure,
          mappedMatchUps,
          targetData,
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
      mappedMatchUps,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

function advanceByeToLoserMatchUp(props) {
  const {
    drawDefinition,
    loserTargetLink,
    loserTargetDrawPosition,
    mappedMatchUps,
  } = props;
  const structureId = loserTargetLink?.target?.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: MISSING_STRUCTURE };

  return assignDrawPositionBye({
    drawDefinition,
    mappedMatchUps,
    structureId,
    drawPosition: loserTargetDrawPosition,
  });
}
