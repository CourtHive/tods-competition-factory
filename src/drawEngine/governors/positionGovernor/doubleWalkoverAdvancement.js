import { getPairedPreviousMatchUpIsWalkover } from './getPairedPreviousMatchUpisWalkover';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getWalkoverWinningSide } from '../matchUpGovernor/getWalkoverWinningSide';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { modifyMatchUpScore } from '../matchUpGovernor/modifyMatchUpScore';
// import { getDevContext } from '../../../global/globalState';
import { findStructure } from '../../getters/findStructure';
import { positionTargets } from './positionTargets';
import { intersection } from '../../../utilities';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  DRAW_POSITION_ASSIGNED,
  MISSING_MATCHUP,
  MISSING_STRUCTURE,
} from '../../../constants/errorConditionConstants';
import {
  DOUBLE_WALKOVER,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

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

  const { pairedPreviousMatchUpIsWO } =
    getPairedPreviousMatchUpIsWalkover(params);

  // get the targets for the winnerMatchUp
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

  const drawPositions = noContextWinnerMatchUp.drawPositions.filter(Boolean);

  const hasDrawPosition = drawPositions.length === 1;
  const walkoverWinningSide =
    hasDrawPosition &&
    getWalkoverWinningSide({
      matchUpId,
      drawPosition: drawPositions[0],
      inContextDrawMatchUps,
    });

  // assign the WALKOVER status to winnerMatchUp
  const existingWalkover =
    noContextWinnerMatchUp.matchUpStatus === WALKOVER && !drawPositions.length;
  const matchUpStatus = existingWalkover ? DOUBLE_WALKOVER : WALKOVER;
  const result = modifyMatchUpScore({
    ...params,
    matchUp: noContextWinnerMatchUp,
    winningSide: walkoverWinningSide,
    matchUpStatus,
  });
  if (result.error) return result;

  // when there is an existing WO/WO created WALKOVER it is replaced
  // with a DOUBLE_WALKOVER and move on to advancing from this position
  if (existingWalkover)
    return doubleWalkoverAdvancement({ ...params, targetData });

  if (!nextWinnerMatchUp) return { ...SUCCESS };

  // any remaining drawPosition in winnerMatchUp should be advanced
  const drawPositionToAdvance = winnerMatchUpDrawPositions[0];
  if (drawPositionToAdvance) {
    return assignMatchUpDrawPosition({
      drawDefinition,
      inContextDrawMatchUps,
      matchUpId: nextWinnerMatchUp.matchUpId,
      drawPosition: drawPositionToAdvance,
    });
  } else if (pairedPreviousMatchUpIsWO) {
    const noContextNextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
      (matchUp) => matchUp.matchUpId === nextWinnerMatchUp.matchUpId
    );
    if (!noContextNextWinnerMatchUp) return { error: MISSING_MATCHUP };

    const drawPositions =
      noContextNextWinnerMatchUp.drawPositions.filter(Boolean);
    const hasDrawPosition = drawPositions.length === 1;
    if (hasDrawPosition) {
      const drawPosition = drawPositions[0];
      const walkoverWinningSide = getWalkoverWinningSide({
        matchUpId,
        drawPosition,
        inContextDrawMatchUps,
      });
      console.log('existing drawPosition is winningSide', {
        walkoverWinningSide,
      });
    }

    const matchUpStatus =
      noContextNextWinnerMatchUp.matchUpStatus === WALKOVER
        ? WALKOVER
        : DOUBLE_WALKOVER;

    const result = modifyMatchUpScore({
      matchUpId: noContextNextWinnerMatchUp.matchUpId,
      matchUp: noContextNextWinnerMatchUp,
      drawDefinition,
      matchUpStatus,
      removeScore: true,
    });
    if (result.error) return result;

    if (matchUpStatus === DOUBLE_WALKOVER) {
      const advancementResult = doubleWalkoverAdvancement({
        ...params,
        targetData,
        matchUpId,
      });
      if (advancementResult.error) return advancementResult;
    }
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
