import { advanceDrawPosition, assignDrawPositionBye } from '@Mutate/matchUps/drawPositions/assignDrawPositionBye';
import { assignMatchUpDrawPosition } from '@Mutate/matchUps/drawPositions/assignMatchUpDrawPosition';
import { getPairedPreviousMatchUpIsDoubleExit } from '../../../query/matchUps/getPairedPreviousMatchUpIsDoubleExit';
import { getExitWinningSide } from '@Mutate/drawDefinitions/matchUpGovernor/getExitWinningSide';
import { getPositionAssignments } from '@Query/drawDefinition/positionsGetter';
import { modifyMatchUpScore } from '@Mutate/matchUps/score/modifyMatchUpScore';
import { decorateResult } from '@Functions/global/decorateResult';
import { positionTargets } from '@Query/matchUp/positionTargets';
import { definedAttributes } from '@Tools/definedAttributes';
import { findStructure } from '@Acquire/findStructure';
import { overlap } from '@Tools/arrays';

// constants
import { DRAW_POSITION_ASSIGNED, MISSING_MATCHUP, MISSING_STRUCTURE } from '@Constants/errorConditionConstants';
import { BYE, DEFAULTED, DOUBLE_DEFAULT, DOUBLE_WALKOVER, WALKOVER } from '@Constants/matchUpStatusConstants';
import { CONTAINER } from '@Constants/drawDefinitionConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function doubleExitAdvancement(params) {
  const { tournamentRecord, appliedPolicies, drawDefinition, matchUpsMap, targetData, structure, event } = params;
  const stack = 'doubleExitAdvancement';

  if (structure.structureType === CONTAINER) return decorateResult({ result: { ...SUCCESS }, stack });

  const { matchUp: sourceMatchUp, targetMatchUps, targetLinks } = targetData;
  const { loserMatchUp, winnerMatchUp, loserTargetDrawPosition } = targetMatchUps;

  // if the loserMatchUp is a WALKOVER or DEFAULTED and has no participants assigned, then it is an 'empty' exit
  // an 'empty' exit is an exit propagated by a double walkover or double default
  const loserMatchUpIsEmptyExit =
    [WALKOVER, DEFAULTED].includes(loserMatchUp?.matchUpStatus) &&
    !loserMatchUp.sides?.map((side) => side.participantId ?? side.participant).filter(Boolean).length;

  const loserMatchUpIsDoubleExit = loserMatchUp?.matchUpStatus === DOUBLE_WALKOVER;

  if (loserMatchUp && loserMatchUp.matchUpStatus !== BYE) {
    const { loserTargetLink } = targetLinks;
    if (
      appliedPolicies?.progression?.doubleExitPropagateBye ||
      //we also want to propagate a double exit as a BYE if we are targeting
      //the fed in participant
      (loserMatchUp.feedRound && loserMatchUp.sides?.[0]?.participantFed)
    ) {
      const result = advanceByeToLoserMatchUp({
        loserTargetDrawPosition,
        tournamentRecord,
        loserTargetLink,
        drawDefinition,
        loserMatchUp,
        matchUpsMap,
        event,
      });
      if (result.error) return decorateResult({ result, stack });
    } else if (!loserMatchUpIsDoubleExit) {
      // only attemp to advance the loserMatchUp if it is not an 'empty' exit present
      const { feedRound, drawPositions, matchUpId } = loserMatchUp;
      let walkoverWinningSide: number | undefined = feedRound ? 2 : 2 - drawPositions.indexOf(loserTargetDrawPosition);
      walkoverWinningSide = loserMatchUpIsEmptyExit ? loserMatchUp.winningSide : walkoverWinningSide;
      const result = conditionallyAdvanceDrawPosition({
        ...params,
        targetMatchUp: loserMatchUp,
        walkoverWinningSide,
        tournamentRecord,
        sourceMatchUp,
        matchUpId,
      });
      if (result.error) return decorateResult({ result, stack });
    } 
  }
  if (winnerMatchUp) {
    const result = conditionallyAdvanceDrawPosition({
      ...params,
      matchUpId: winnerMatchUp.matchUpId,
      targetMatchUp: winnerMatchUp,
      tournamentRecord,
      sourceMatchUp,
    });
    if (result.error) return decorateResult({ result, stack });
  }

  return decorateResult({ result: { ...SUCCESS }, stack });
}


// 1. Assigns a WALKOVER or DEFAULTED status to the winnerMatchUp
// 2. Advances any drawPosition that is already present
function conditionallyAdvanceDrawPosition(params) {
  const { inContextDrawMatchUps, tournamentRecord, drawDefinition, sourceMatchUp, targetMatchUp, matchUpsMap } = params;

  const structure = drawDefinition.structures.find(({ structureId }) => structureId === targetMatchUp.structureId);

  const DOUBLE_EXIT = params.matchUpStatus === DOUBLE_DEFAULT ? DOUBLE_DEFAULT : DOUBLE_WALKOVER;
  const EXIT = params.matchUpStatus === DOUBLE_DEFAULT ? DEFAULTED : WALKOVER;

  const stack = 'conditionallyAdvanceDrawPosition';

  const noContextTargetMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === targetMatchUp.matchUpId,
  );
  if (!noContextTargetMatchUp) return { error: MISSING_MATCHUP };

  const sourceDrawPositions = sourceMatchUp?.drawPositions || [];
  let targetMatchUpDrawPositions = noContextTargetMatchUp.drawPositions?.filter(Boolean);

  const sameStructure = sourceMatchUp?.structureId === targetMatchUp.structureId;

  // ensure targetMatchUp.drawPositions does not contain sourceMatchUp.drawPositions
  // this covers the case where a pre-existing advancement was made
  if (sameStructure && overlap(sourceDrawPositions, targetMatchUpDrawPositions)) {
    targetMatchUpDrawPositions = targetMatchUpDrawPositions.filter(
      (drawPosition) => !sourceDrawPositions.includes(drawPosition),
    );
  }

  // if there are 2 drawPositions in targetMatchUp, something is wrong
  if (sameStructure && targetMatchUpDrawPositions.length > 1)
    return decorateResult({ result: { error: DRAW_POSITION_ASSIGNED }, stack });

  const { pairedPreviousMatchUpIsDoubleExit, pairedPreviousMatchUp } = getPairedPreviousMatchUpIsDoubleExit(params);

  // get the targets for the targetMatchUp
  const targetData = positionTargets({
    matchUpId: targetMatchUp.matchUpId,
    inContextDrawMatchUps,
    drawDefinition,
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

  const drawPositions = noContextTargetMatchUp.drawPositions?.filter(Boolean) || [];

  const hasDrawPosition = drawPositions.length === 1;
  const walkoverWinningSide =
    params.walkoverWinningSide ||
    (hasDrawPosition &&
      getExitWinningSide({
        drawPosition: drawPositions[0],
        matchUpId: targetMatchUp.matchUpId,
        inContextDrawMatchUps,
      })) ||
    undefined;

  // assign the WALKOVER status to targetMatchUp
  const existingExit = [WALKOVER, DEFAULTED].includes(noContextTargetMatchUp.matchUpStatus) && !drawPositions.length;
  const isFinal = noContextTargetMatchUp.finishingRound === 1;

  const matchUpStatus = existingExit && !isFinal ? DOUBLE_EXIT : EXIT;

  const inContextPairedPreviousMatchUp = inContextDrawMatchUps.find(
    (candidate) => candidate.matchUpId === pairedPreviousMatchUp.matchUpId,
  );
  let matchUpStatusCodes: any[] = [];
  let sourceSideNumber;

  if (sourceMatchUp) {
    if (sourceMatchUp?.structureId === inContextPairedPreviousMatchUp?.structureId) {
      // if structureIds are equivalent then sideNumber is inferred from roundPositions
      if (sourceMatchUp.roundPosition < pairedPreviousMatchUp?.roundPosition) {
        sourceSideNumber = 1;
      } else {
        sourceSideNumber = 2;
      }
    } else if (targetMatchUp.feedRound) {
      // if different structureIds then structureId that is not equivalent to noContextTargetMatchUp.structureId is fed
      // ... and fed positions are always sideNumber 1
      if (sourceMatchUp.structureId === targetMatchUp.structureId) {
        sourceSideNumber = 2;
      } else {
        sourceSideNumber = 1;
      }
    } else if (walkoverWinningSide) sourceSideNumber = 3 - walkoverWinningSide;
  }

  const sourceMatchUpStatus = params.matchUpStatus;
  const pairedMatchUpStatus = pairedPreviousMatchUp?.matchUpStatus;

  if (sourceSideNumber === 1) {
    matchUpStatusCodes = [
      {
        matchUpStatus: producedMatchUpStatus(sourceMatchUpStatus),
        previousMatchUpStatus: sourceMatchUpStatus,
        sideNumber: 1,
      },
      {
        matchUpStatus: producedMatchUpStatus(pairedMatchUpStatus),
        previousMatchUpStatus: pairedMatchUpStatus,
        sideNumber: 2,
      },
    ];
  } else if (sourceSideNumber === 2) {
    matchUpStatusCodes = [
      {
        matchUpStatus: producedMatchUpStatus(pairedMatchUpStatus),
        previousMatchUpStatus: pairedMatchUpStatus,
        sideNumber: 1,
      },
      {
        matchUpStatus: producedMatchUpStatus(sourceMatchUpStatus),
        previousMatchUpStatus: sourceMatchUpStatus,
        sideNumber: 2,
      },
    ];
  }

  if (matchUpStatusCodes.length) matchUpStatusCodes = matchUpStatusCodes.map((code) => definedAttributes(code));

  const result = modifyMatchUpScore({
    ...params,
    winningSide: walkoverWinningSide,
    matchUp: noContextTargetMatchUp,
    matchUpStatusCodes,
    context: stack,
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

  if (!nextWinnerMatchUp) return decorateResult({ result: { ...SUCCESS }, stack });

  // any remaining drawPosition in targetMatchUp should be advanced
  const drawPositionToAdvance =
    targetMatchUpDrawPositions.length === 2
      ? targetMatchUpDrawPositions[walkoverWinningSide - 1]
      : targetMatchUpDrawPositions[0];

  const { positionAssignments } = getPositionAssignments({ structure });
  const assignment = positionAssignments?.find((assignment) => assignment.drawPosition === drawPositionToAdvance);

  const noContextNextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === nextWinnerMatchUp.matchUpId,
  );
  const nextWinnerMatchUpDrawPositions = noContextNextWinnerMatchUp?.drawPositions?.filter(Boolean);
  const nextWinnerMatchUpHasDrawPosition = nextWinnerMatchUpDrawPositions.length === 1;

  if (drawPositionToAdvance) {
    if (assignment?.bye) {
      // WO/WO advanced by BYE
      const targetData = positionTargets({
        matchUpId: noContextNextWinnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        drawDefinition,
      });

      if (nextWinnerMatchUpHasDrawPosition) {
        const nextDrawPositionToAdvance = nextWinnerMatchUpDrawPositions.filter(Boolean)[0];

        // if the next targetMatchUp already has a drawPosition
        const winningSide = getExitWinningSide({
          drawPosition: nextDrawPositionToAdvance,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          inContextDrawMatchUps,
        });

        const result = modifyMatchUpScore({
          appliedPolicies: params.appliedPolicies,
          matchUpId: noContextNextWinnerMatchUp.matchUpId,
          matchUp: noContextNextWinnerMatchUp,
          matchUpStatus: EXIT,
          matchUpStatusCodes: [],
          removeScore: true,
          context: stack,
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
      } else if ([WALKOVER, DEFAULTED].includes(nextWinnerMatchUp.matchUpStatus)) {
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

    const matchUpStatus = [WALKOVER, DEFAULTED].includes(noContextNextWinnerMatchUp.matchUpStatus) ? EXIT : DOUBLE_EXIT;

    const result = modifyMatchUpScore({
      matchUpId: noContextNextWinnerMatchUp.matchUpId,
      appliedPolicies: params.appliedPolicies,
      matchUp: noContextNextWinnerMatchUp,
      matchUpStatusCodes: [],
      removeScore: true,
      context: stack,
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
    event,
    loserMatchUp,
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
    loserMatchUp,
    event,
  });
}

function producedMatchUpStatus(previousMatchUpStatus) {
  if (previousMatchUpStatus === DOUBLE_WALKOVER) return WALKOVER;
  if (previousMatchUpStatus === DOUBLE_DEFAULT) return DEFAULTED;
  return previousMatchUpStatus;
}
