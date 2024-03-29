import { attemptToModifyScore } from '@Mutate/drawDefinitions/matchUpGovernor/attemptToModifyScore';
import { assignDrawPositionBye } from '@Mutate/matchUps/drawPositions/assignDrawPositionBye';
import { updateTieMatchUpScore } from '@Mutate/matchUps/score/updateTieMatchUpScore';
import { isDirectingMatchUpStatus } from '@Query/matchUp/checkStatusType';
import { decorateResult } from '@Functions/global/decorateResult';
import { isAdHoc } from '@Query/drawDefinition/isAdHoc';
import { directWinner } from './directWinner';
import { directLoser } from './directLoser';

// constants
import { MISSING_DRAW_POSITIONS } from '@Constants/errorConditionConstants';
import { COMPLETED } from '@Constants/matchUpStatusConstants';
import { SUCCESS } from '@Constants/resultConstants';

export function directParticipants(params) {
  const stack = 'directParticipants';
  const result = attemptToModifyScore(params);

  if (result.error) return decorateResult({ result, stack });
  const matchUpStatusIsValid = isDirectingMatchUpStatus({
    matchUpStatus: params.matchUpStatus,
  });

  const {
    dualWinningSideChange,
    projectedWinningSide,
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    matchUpStatus,
    dualMatchUp,
    matchUpsMap,
    winningSide,
    targetData,
    matchUpId,
    structure,
    matchUp,
    event,
  } = params;

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const isAdHocMatchUp = isAdHoc({ structure });
  let drawPositions = matchUp.drawPositions;

  let annotate;
  if (isCollectionMatchUp) {
    const { matchUpTieId, matchUpsMap } = params;
    const tieMatchUpResult = updateTieMatchUpScore({
      appliedPolicies: params.appliedPolicies,
      matchUpId: matchUpTieId,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      event,
    });
    annotate = tieMatchUpResult && { tieMatchUpResult };
    const matchUpTie = inContextDrawMatchUps.find(({ matchUpId }) => matchUpId === matchUpTieId);
    drawPositions = matchUpTie?.drawPositions;
    if (!dualWinningSideChange) {
      return decorateResult({ result: { ...SUCCESS, ...annotate }, stack });
    }
  }

  if (isAdHocMatchUp) {
    return decorateResult({ result: { ...SUCCESS, ...annotate }, stack });
  }

  if (drawPositions) {
    // if projectedWinningSide is present then a TEAM matchUp is being directed, not the tieMatchUp
    const winningIndex = projectedWinningSide ? projectedWinningSide - 1 : winningSide - 1;
    const losingIndex = 1 - winningIndex;

    const winningDrawPosition = drawPositions[winningIndex];
    const loserDrawPosition = drawPositions[losingIndex];

    const {
      targetLinks: { loserTargetLink, winnerTargetLink, byeTargetLink },
      targetMatchUps: {
        winnerMatchUpDrawPositionIndex, // only present when positionTargets found without winnerMatchUpId
        loserMatchUpDrawPositionIndex, // only present when positionTargets found without loserMatchUpId
        winnerMatchUp,
        loserMatchUp,
        byeMatchUp,
      },
    } = targetData;

    if (winnerMatchUp) {
      const result = directWinner({
        sourceMatchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
        winnerMatchUpDrawPositionIndex,
        sourceMatchUpId: matchUpId,
        inContextDrawMatchUps,
        projectedWinningSide,
        winningDrawPosition,
        tournamentRecord,
        winnerTargetLink,
        drawDefinition,
        winnerMatchUp,
        dualMatchUp,
        matchUpsMap,
        event,
      });
      if (result.error) return decorateResult({ result, stack });
    }
    if (loserMatchUp) {
      const result = directLoser({
        sourceMatchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
        loserMatchUpDrawPositionIndex,
        sourceMatchUpId: matchUpId,
        inContextDrawMatchUps,
        projectedWinningSide,
        loserDrawPosition,
        tournamentRecord,
        loserTargetLink,
        drawDefinition,
        loserMatchUp,
        winningSide,
        matchUpsMap,
        dualMatchUp,
        event,
      });
      if (result.error) return decorateResult({ result, stack });
    }

    if (byeMatchUp) {
      const targetMatchUpDrawPositions = byeMatchUp.drawPositions || [];
      const backdrawPosition = Math.min(...targetMatchUpDrawPositions.filter(Boolean));
      const targetStructureId = byeTargetLink.target.structureId;
      const result = assignDrawPositionBye({
        drawPosition: backdrawPosition,
        structureId: targetStructureId,
        tournamentRecord,
        drawDefinition,
        event,
      });
      if (result.error) return decorateResult({ result, stack });
    }
  } else {
    return decorateResult({ result: { error: MISSING_DRAW_POSITIONS }, stack });
  }

  return decorateResult({ result: { ...SUCCESS, ...annotate }, stack });
}
