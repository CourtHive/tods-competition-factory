import { getPairedPreviousMatchUpIsDoubleExit } from './getPairedPreviousMatchUpIsDoubleExit';
import { assignMatchUpDrawPosition } from '../matchUpGovernor/assignMatchUpDrawPosition';
import { getExitWinningSide } from '../matchUpGovernor/getExitWinningSide';
import { modifyMatchUpScore } from '../matchUpGovernor/modifyMatchUpScore';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getPositionAssignments } from '../../getters/positionsGetter';
import { definedAttributes } from '../../../utilities/objects';
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
    appliedPolicies,
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
    if (appliedPolicies?.progression?.doubleExitPropagateLoserWalkover) {
      const { feedRound, drawPositions, matchUpId } = loserMatchUp;
      const winningSide = feedRound
        ? 2
        : 2 - drawPositions.indexOf(loserTargetDrawPosition);
      const noContextLoserMatchUp = matchUpsMap.drawMatchUps.find(
        (matchUp) => matchUp.matchUpId === loserMatchUp.matchUpId
      );
      const result = modifyMatchUpScore({
        matchUp: noContextLoserMatchUp,
        tournamentRecord,
        drawDefinition,
        winningSide,
        matchUpId,
        // matchUpStatusCodes,
        matchUpStatus: WALKOVER,
      });
      if (result.error) return decorateResult({ result, stack });
    } else {
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
  }

  if (winnerMatchUp) {
    const result = conditionallyAdvanceDrawPosition({
      ...params,
      matchUpId: winnerMatchUp.matchUpId,
      tournamentRecord,
      sourceMatchUp,
      winnerMatchUp,
      targetMatchUp: winnerMatchUp,
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
    targetMatchUp,
    matchUpsMap,
    structure,
  } = params;

  const DOUBLE_EXIT =
    params.matchUpStatus === DOUBLE_DEFAULT ? DOUBLE_DEFAULT : DOUBLE_WALKOVER;
  const EXIT = params.matchUpStatus === DOUBLE_DEFAULT ? DEFAULTED : WALKOVER;

  const stack = 'conditionallyAdvanceDrawPosition';

  const noContextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === targetMatchUp.matchUpId
  );
  if (!noContextWinnerMatchUp) return { error: MISSING_MATCHUP };

  const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
  let winnerMatchUpDrawPositions =
    noContextWinnerMatchUp.drawPositions?.filter(Boolean);

  // ensure targetMatchUp.drawPositions does not contain sourceMatchUp.drawPositions
  // this covers the case where a pre-existing advancement was made
  if (overlap(sourceDrawPositions, winnerMatchUpDrawPositions)) {
    winnerMatchUpDrawPositions = winnerMatchUpDrawPositions.filter(
      (drawPosition) => !sourceDrawPositions.includes(drawPosition)
    );
  }

  // if there are 2 drawPositions in targetMatchUp, something is wrong
  if (winnerMatchUpDrawPositions.length > 1)
    return decorateResult({ result: { error: DRAW_POSITION_ASSIGNED }, stack });

  const { pairedPreviousMatchUpIsDoubleExit, pairedPreviousMatchUp } =
    getPairedPreviousMatchUpIsDoubleExit(params);

  // get the targets for the targetMatchUp
  const targetData = positionTargets({
    matchUpId: targetMatchUp.matchUpId,
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
        matchUpId: targetMatchUp.matchUpId,
        inContextDrawMatchUps,
      })) ||
    undefined;

  // assign the WALKOVER status to targetMatchUp
  const existingExit =
    [WALKOVER, DEFAULTED].includes(noContextWinnerMatchUp.matchUpStatus) &&
    !drawPositions.length;
  const isFinal = noContextWinnerMatchUp.finishingRound === 1;

  const matchUpStatus = existingExit && !isFinal ? DOUBLE_EXIT : EXIT;

  const inContextPairedPreviousMatchUp = inContextDrawMatchUps.find(
    (candidate) => candidate.matchUpId === pairedPreviousMatchUp.matchUpId
  );
  let matchUpStatusCodes = [];
  let sourceSideNumber;

  if (sourceMatchUp) {
    if (
      sourceMatchUp?.structureId === inContextPairedPreviousMatchUp?.structureId
    ) {
      // if structureIds are equivalent then sideNumber is inferred from roundPositions
      if (sourceMatchUp.roundPosition < pairedPreviousMatchUp?.roundPosition) {
        sourceSideNumber = 1;
      } else {
        sourceSideNumber = 2;
      }
    } else {
      // if different structureIds then structureId that is not equivalent to noContextWinnerMatchUp.structureId is fed
      // ... and fed positions are always sideNumber 1
      if (sourceMatchUp.structureId === targetMatchUp.structureId) {
        sourceSideNumber = 2;
      } else {
        sourceSideNumber = 1;
      }
    }
  }

  const sourceMatchUpStatus = params.matchUpStatus;
  const pairedMatchUpStatus = pairedPreviousMatchUp?.matchUpStatus;

  const producedMatchUpStatus = (previousMatchUpStatus) =>
    previousMatchUpStatus === DOUBLE_WALKOVER
      ? WALKOVER
      : previousMatchUpStatus === DOUBLE_DEFAULT
      ? DEFAULTED
      : undefined;

  if (sourceSideNumber === 1) {
    matchUpStatusCodes = [
      {
        sideNumber: 1,
        previousMatchUpStatus: sourceMatchUpStatus,
        matchUpStatus: producedMatchUpStatus(sourceMatchUpStatus),
      },
      {
        sideNumber: 2,
        previousMatchUpStatus: pairedMatchUpStatus,
        matchUpStatus: producedMatchUpStatus(pairedMatchUpStatus),
      },
    ];
  } else if (sourceSideNumber === 2) {
    matchUpStatusCodes = [
      {
        sideNumber: 1,
        previousMatchUpStatus: pairedMatchUpStatus,
        matchUpStatus: producedMatchUpStatus(pairedMatchUpStatus),
      },
      {
        sideNumber: 2,
        previousMatchUpStatus: sourceMatchUpStatus,
        matchUpStatus: producedMatchUpStatus(sourceMatchUpStatus),
      },
    ];
  }

  if (matchUpStatusCodes.length)
    matchUpStatusCodes = matchUpStatusCodes.map((code) =>
      definedAttributes(code)
    );

  const result = modifyMatchUpScore({
    ...params,
    matchUp: noContextWinnerMatchUp,
    winningSide: walkoverWinningSide,
    matchUpStatusCodes,
    matchUpStatus,
  });
  if (result.error) return decorateResult({ result, stack });

  // when there is an existing 'Double Exit", the created "Exit" is replaced
  // with a "Double Exit" and move on to advancing from this position
  if (existingExit) {
    return doubleExitAdvancement({
      ...params,
      matchUpStatus,
      targetData,
    });
  }

  if (!nextWinnerMatchUp)
    return decorateResult({ result: { ...SUCCESS }, stack });

  // any remaining drawPosition in targetMatchUp should be advanced
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

        // if the next targetMatchUp already has a drawPosition
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
        // if the next targetMatchUp is a double walkover or double default
        const result = doubleExitAdvancement({
          ...params,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUpStatus,
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
  } else if (pairedPreviousMatchUpIsDoubleExit) {
    if (!noContextNextWinnerMatchUp) return { error: MISSING_MATCHUP };

    if (nextWinnerMatchUpHasDrawPosition) {
      const drawPosition = nextWinnerMatchUpDrawPositions[0];
      const walkoverWinningSide = getExitWinningSide({
        matchUpId: targetMatchUp.matchUpId,
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
        matchUpId: targetMatchUp.matchUpId,
        matchUpStatus,
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
