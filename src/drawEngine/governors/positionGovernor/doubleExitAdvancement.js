import { getPairedPreviousMatchUpIsWOWO } from './getPairedPreviousMatchUpisWOWO';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getExitWinningSide } from '../matchUpGovernor/getExitWinningSide';
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
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function doubleExitAdvancement(params) {
  const {
    tournamentRecord,
    drawDefinition,
    matchUpsMap,
    targetData,
    structure,
  } = params;
  const stack = 'doubleExitAdvancement';

  if (structure.structureType === CONTAINER)
    return decorateResult({ result: { ...SUCCESS }, stack });

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

  return decorateResult({ result: { ...SUCCESS }, stack });
}

// 1. Assigns a WALKOVER or DEFAULTED status to the winnerMatchUp
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

  const DOUBLE_EXIT =
    params.matchUpStatus === DOUBLE_DEFAULT ? DOUBLE_DEFAULT : DOUBLE_WALKOVER;
  const EXIT = params.matchUpStatus === DOUBLE_DEFAULT ? DEFAULTED : WALKOVER;

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
      getExitWinningSide({
        drawPosition: drawPositions[0],
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
      })) ||
    undefined;

  // assign the WALKOVER status to winnerMatchUp
  const existingExit =
    [WALKOVER, DEFAULTED].includes(noContextWinnerMatchUp.matchUpStatus) &&
    !drawPositions.length;
  const isFinal = noContextWinnerMatchUp.finishingRound === 1;

  const matchUpStatus = existingExit && !isFinal ? DOUBLE_EXIT : EXIT;

  const result = modifyMatchUpScore({
    ...params,
    matchUp: noContextWinnerMatchUp,
    winningSide: walkoverWinningSide,
    matchUpStatusCodes: [],
    matchUpStatus,
  });
  if (result.error) return decorateResult({ result, stack });

  // when there is an existing 'Double Exit", the created "Exit" is replaced
  // with a "Double Exit" and move on to advancing from this position
  if (existingExit) {
    return doubleExitAdvancement({
      ...params,
      matchUpStatusCodes: [],
      targetData,
    });
  }

  if (!nextWinnerMatchUp)
    return decorateResult({ result: { ...SUCCESS }, stack });

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
        const winningSide = getExitWinningSide({
          drawPosition: nextDrawPositionToAdvance,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          inContextDrawMatchUps,
        });

        const result = modifyMatchUpScore({
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUp: noContextNextWinnerMatchUp,
          matchUpStatus: EXIT,
          matchUpStatusCodes: [],
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
      } else if (
        [WALKOVER, DEFAULTED].includes(nextWinnerMatchUp.matchUpStatus)
      ) {
        // if the next winnerMatchUp is a double walkover or double default
        const result = doubleExitAdvancement({
          ...params,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUpStatusCodes: [], // don't propagate matchUpStatusCodes
          targetData,
        });
        if (result.error) return decorateResult({ result, stack });
      }

      return decorateResult({ result: { ...SUCCESS }, stack });
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
      const walkoverWinningSide = getExitWinningSide({
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        drawPosition,
      });
      console.log('existing drawPosition is winningSide', {
        walkoverWinningSide,
      });
    }

    const matchUpStatus = [WALKOVER, DEFAULTED].includes(
      noContextNextWinnerMatchUp.matchUpStatus
    )
      ? EXIT
      : DOUBLE_EXIT;

    /*
    const matchUpStatus =
      noContextNextWinnerMatchUp.matchUpStatus === EXIT ? EXIT : DOUBLE_EXIT;
      */

    const result = modifyMatchUpScore({
      matchUpId: noContextNextWinnerMatchUp.matchUpId,
      matchUp: noContextNextWinnerMatchUp,
      matchUpStatusCodes: [],
      removeScore: true,
      drawDefinition,
      matchUpStatus,
    });

    if (result.error) return decorateResult({ result, stack });

    if (matchUpStatus === DOUBLE_EXIT) {
      const advancementResult = doubleExitAdvancement({
        ...params,
        matchUpStatusCodes: [], // don't propagate matchUpStatusCodes
        matchUpId: winnerMatchUp.matchUpId,
        targetData,
      });
      if (advancementResult.error) return advancementResult;
    }
  }
  return decorateResult({ result: { ...SUCCESS }, stack });
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
