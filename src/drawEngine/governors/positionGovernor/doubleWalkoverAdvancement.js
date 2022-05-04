import { getPairedPreviousMatchUpIsWOWO } from './getPairedPreviousMatchUpisWOWO';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getWalkoverWinningSide } from '../matchUpGovernor/getWalkoverWinningSide';
import { modifyMatchUpScore } from '../matchUpGovernor/modifyMatchUpScore';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { findStructure } from '../../getters/findStructure';
import { positionTargets } from './positionTargets';
import { overlap } from '../../../utilities';
import {
  advanceDrawPosition,
  assignDrawPositionBye,
} from './byePositioning/assignDrawPositionBye';

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
    tournamentRecord,
    drawDefinition,
    matchUpsMap,
    targetData,
    structure,
  } = params;
  if (structure.structureType === CONTAINER) return SUCCESS;

  const stack = 'doubleWalkoverAdvancement';

  const { matchUp: sourceMatchUp, targetMatchUps, targetLinks } = targetData;
  const { loserMatchUp, winnerMatchUp, loserTargetDrawPosition } =
    targetMatchUps;

  if (loserMatchUp) {
    const { loserTargetLink } = targetLinks;
    const result = advanceByeToLoserMatchUp({
      loserTargetDrawPosition,
      tournamentRecord,
      loserTargetLink,
      drawDefinition,
      loserMatchUp,
      matchUpsMap,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  if (winnerMatchUp) {
    const result = conditionallyAdvanceDrawPosition({
      ...params,
      matchUpId: winnerMatchUp.matchUpId,
      tournamentRecord,
      sourceMatchUp,
      winnerMatchUp,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  return { ...SUCCESS };
}

// 1. Assigns a WALKOVER status to the winnerMatchUp
// 2. Advances any drawPosition that is already present
function conditionallyAdvanceDrawPosition(params) {
  const {
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    sourceMatchUp,
    winnerMatchUp,
    matchUpsMap,
    structure,
  } = params;

  const stack = 'conditionallyAdvanceDrawPosition';

  const noContextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
  );
  if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };

  const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
  let winnerMatchUpDrawPositions =
    noContextWinnerMatchUp.drawPositions?.filter(Boolean);

  // ensure winnerMatchUp.drawPositions does not contain sourceMatchUp.drawPositions
  // this covers the case where a pre-existing advancement was made
  if (overlap(sourceDrawPositions, winnerMatchUpDrawPositions)) {
    winnerMatchUpDrawPositions = winnerMatchUpDrawPositions.filter(
      (drawPosition) => !sourceDrawPositions.includes(drawPosition)
    );
  }

  // if there are 2 drawPositions in winnerMatchUp, something is wrong
  if (winnerMatchUpDrawPositions.length > 1)
    return decorateResult({ result: { error: DRAW_POSITION_ASSIGNED }, stack });

  const { pairedPreviousMatchUpisWOWO } =
    getPairedPreviousMatchUpIsWOWO(params);

  // get the targets for the winnerMatchUp
  const targetData = positionTargets({
    matchUpId: winnerMatchUp.matchUpId,
    inContextDrawMatchUps,
    drawDefinition,
    structure,
  });
  const { targetMatchUps, targetLinks } = targetData;

  const {
    loserTargetDrawPosition: nextLoserTargetDrawPosition,
    winnerMatchUp: nextWinnerMatchUp,
    loserMatchUp: nextLoserMatchUp,
  } = targetMatchUps;

  if (nextLoserMatchUp) {
    const { loserTargetLink } = targetLinks;
    const result = advanceByeToLoserMatchUp({
      loserTargetDrawPosition: nextLoserTargetDrawPosition,
      loserMatchUp: nextLoserMatchUp,
      tournamentRecord,
      loserTargetLink,
      drawDefinition,
      matchUpsMap,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  const drawPositions =
    noContextWinnerMatchUp.drawPositions?.filter(Boolean) || [];

  const hasDrawPosition = drawPositions.length === 1;
  const walkoverWinningSide =
    (hasDrawPosition &&
      getWalkoverWinningSide({
        drawPosition: drawPositions[0],
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
      })) ||
    undefined;

  // assign the WALKOVER status to winnerMatchUp
  const existingWalkover =
    noContextWinnerMatchUp.matchUpStatus === WALKOVER && !drawPositions.length;
  const isFinal = noContextWinnerMatchUp.finishingRound === 1;

  const matchUpStatus =
    existingWalkover && !isFinal ? DOUBLE_WALKOVER : WALKOVER;

  const result = modifyMatchUpScore({
    ...params,
    matchUp: noContextWinnerMatchUp,
    winningSide: walkoverWinningSide,
    matchUpStatusCodes: [],
    matchUpStatus,
  });
  if (result.error) return decorateResult({ result, stack });

  // when there is an existing WO/WO created WALKOVER it is replaced
  // with a DOUBLE_WALKOVER and move on to advancing from this position
  if (existingWalkover) {
    return doubleWalkoverAdvancement({
      ...params,
      matchUpStatusCodes: [],
      targetData,
    });
  }

  if (!nextWinnerMatchUp) return { ...SUCCESS };

  // any remaining drawPosition in winnerMatchUp should be advanced
  const drawPositionToAdvance = winnerMatchUpDrawPositions[0];
  const { positionAssignments } = getPositionAssignments({ structure });
  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPositionToAdvance
  );

  const noContextNextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === nextWinnerMatchUp.matchUpId
  );
  const nextWinnerMatchUpDrawPositions =
    noContextNextWinnerMatchUp?.drawPositions?.filter(Boolean);
  const nextWinnerMatchUpHasDrawPosition =
    nextWinnerMatchUpDrawPositions.length === 1;

  if (drawPositionToAdvance) {
    if (assignment.bye) {
      // WO/WO advanced by BYE
      const targetData = positionTargets({
        matchUpId: noContextNextWinnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        drawDefinition,
        structure,
      });

      if (nextWinnerMatchUpHasDrawPosition) {
        const nextDrawPositionToAdvance =
          nextWinnerMatchUpDrawPositions.filter(Boolean)[0];

        // if the next winnerMatchUp already has a drawPosition
        const winningSide = getWalkoverWinningSide({
          drawPosition: nextDrawPositionToAdvance,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          inContextDrawMatchUps,
        });

        const result = modifyMatchUpScore({
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUp: noContextNextWinnerMatchUp,
          matchUpStatus: WALKOVER,
          removeScore: true,
          drawDefinition,
          winningSide,
        });
        if (result.error) return decorateResult({ result, stack });

        return advanceDrawPosition({
          drawPositionToAdvance: nextDrawPositionToAdvance,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          inContextDrawMatchUps,
          drawDefinition,
          matchUpsMap,
        });
      } else if (nextWinnerMatchUp.matchUpStatus === WALKOVER) {
        // if the next winnerMatchUp is a doubleWalkover
        const result = doubleWalkoverAdvancement({
          ...params,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUpStatusCodes: [], // don't propagate matchUpStatusCodes
          targetData,
        });
        if (result.error) return decorateResult({ result, stack });
      }

      return { ...SUCCESS };
    }

    return assignMatchUpDrawPosition({
      matchUpId: nextWinnerMatchUp.matchUpId,
      drawPosition: drawPositionToAdvance,
      inContextDrawMatchUps,
      drawDefinition,
    });
  } else if (pairedPreviousMatchUpisWOWO) {
    if (!noContextNextWinnerMatchUp) return { error: MISSING_MATCHUP };

    if (nextWinnerMatchUpHasDrawPosition) {
      const drawPosition = nextWinnerMatchUpDrawPositions[0];
      const walkoverWinningSide = getWalkoverWinningSide({
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        drawPosition,
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
      removeScore: true,
      drawDefinition,
      matchUpStatus,
    });

    if (result.error) return decorateResult({ result, stack });

    if (matchUpStatus === DOUBLE_WALKOVER) {
      const advancementResult = doubleWalkoverAdvancement({
        ...params,
        matchUpStatusCodes: [], // don't propagate matchUpStatusCodes
        matchUpId: winnerMatchUp.matchUpId,
        targetData,
      });
      if (advancementResult.error) return advancementResult;
    }
  }
  return SUCCESS;
}

function advanceByeToLoserMatchUp(params) {
  const {
    loserTargetDrawPosition,
    tournamentRecord,
    loserTargetLink,
    drawDefinition,
    matchUpsMap,
  } = params;
  const structureId = loserTargetLink?.target?.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: MISSING_STRUCTURE };

  return assignDrawPositionBye({
    drawPosition: loserTargetDrawPosition,
    tournamentRecord,
    drawDefinition,
    structureId,
    matchUpsMap,
  });
}
