import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { modifyMatchUpScore } from '../matchUpGovernor/modifyMatchUpScore';
import { findStructure } from '../../getters/findStructure';
import { intersection } from '../../../utilities';
import { positionTargets } from './positionTargets';

import {
  DOUBLE_WALKOVER,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_POSITION_ASSIGNED,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';

export function doubleWalkoverAdvancement(params) {
  const {
    drawDefinition,
    structure,
    targetData,

    matchUpsMap,
  } = params;

  if (structure.structureType === CONTAINER) return SUCCESS;
  const { matchUp: sourceMatchUp, targetMatchUps, targetLinks } = targetData;

  const { loserMatchUp, winnerMatchUp, loserTargetDrawPosition } =
    targetMatchUps;

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
      ...params,

      matchUpId: winnerMatchUp.matchUpId,
      sourceMatchUp,
      winnerMatchUp,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

// 1. Assigns a WALKOVER status to the winnerMatchUp
// 2. Advances any drawPosition that is already present
function conditionallyAdvanceDrawPosition(params) {
  const {
    drawDefinition,
    structure,

    matchUpId,
    sourceMatchUp,
    winnerMatchUp,
    inContextDrawMatchUps,

    matchUpsMap,
  } = params;

  const noContextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
  );
  if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };

  const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
  let winnerMatchUpDrawPositions =
    noContextWinnerMatchUp.drawPositions.filter(Boolean);

  // insure winnerMatchUp.drawPositions does not contain sourceMatchUp.drawPositions
  // this covers the case where a pre-existing advancement was made
  if (intersection(sourceDrawPositions, winnerMatchUpDrawPositions).length) {
    winnerMatchUpDrawPositions = winnerMatchUpDrawPositions.filter(
      (drawPosition) => !sourceDrawPositions.includes(drawPosition)
    );
  }

  // if there are 2 drawPositions in winnerMatchUp, something is wrong
  if (winnerMatchUpDrawPositions.length > 1)
    return { error: DRAW_POSITION_ASSIGNED };

  // any remaining drawPosition in winnerMatchUp should be advanced
  const drawPositionToAdvance = winnerMatchUpDrawPositions[0];

  // assign the WALKOVER status to winnerMatchUp
  const result = modifyMatchUpScore({
    ...params,
    matchUp: noContextWinnerMatchUp,
    matchUpStatus: WALKOVER,
  });
  if (result.error) return result;

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
        const result = modifyMatchUpScore({
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUp: noContextNextWinnerMatchUp,
          drawDefinition,
          matchUpStatus: DOUBLE_WALKOVER,
          matchUpStatusCodes: [],
          removeScore: true,
        });
        if (result.error) return result;

        const advancementResult = doubleWalkoverAdvancement({
          ...params,
          targetData,
          matchUpId,
        });
        if (advancementResult.error) return advancementResult;
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
