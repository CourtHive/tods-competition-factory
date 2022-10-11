import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { decorateResult } from '../../../global/functions/decorateResult';
import { isDirectingMatchUpStatus } from './checkStatusType';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { isAdHoc } from '../queryGovernor/isAdHoc';
import { directWinner } from './directWinner';
import { directLoser } from './directLoser';

import { COMPLETED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_ASSIGNMENTS,
  MISSING_DRAW_POSITIONS,
} from '../../../constants/errorConditionConstants';

export function directParticipants(params) {
  const matchUpStatusIsValid = isDirectingMatchUpStatus({
    matchUpStatus: params.matchUpStatus,
  });

  const {
    dualWinningSideChange,
    projectedWinningSide,
    inContextDrawMatchUps,
    matchUpStatusCodes,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    matchUpStatus,
    dualMatchUp,
    matchUpsMap,
    winningSide,
    targetData,
    matchUpId,
    structure,
    matchUp,
    event,
    score,
  } = params;

  const stack = 'directParticipants';
  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  const isAdHocMatchUp = isAdHoc({ drawDefinition, structure });
  const validToScore =
    isCollectionMatchUp ||
    isAdHocMatchUp ||
    drawPositionsAssignedParticipantIds({ structure, matchUp });

  if (!validToScore) {
    return { error: MISSING_ASSIGNMENTS };
  }

  const removeScore = [WALKOVER].includes(matchUpStatus);

  const result = modifyMatchUpScore({
    matchUpStatusCodes: (matchUpStatusIsValid && matchUpStatusCodes) || [],
    matchUpStatus: (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
    tournamentRecord,
    drawDefinition,
    matchUpFormat,
    removeScore,
    winningSide,
    matchUpId,
    matchUp,
    event,
    score,
  });
  if (result.error) return decorateResult({ result, stack });

  let drawPositions = matchUp.drawPositions;

  if (isCollectionMatchUp) {
    const { matchUpTieId } = params;
    updateTieMatchUpScore({
      matchUpId: matchUpTieId,
      tournamentRecord,
      drawDefinition,
      event,
    });
    const matchUpTie = inContextDrawMatchUps.find(
      ({ matchUpId }) => matchUpId === matchUpTieId
    );
    drawPositions = matchUpTie?.drawPositions;
    if (!dualWinningSideChange)
      return decorateResult({ result: { ...SUCCESS }, stack });
  }

  if (isAdHocMatchUp) {
    return decorateResult({ result: { ...SUCCESS }, stack });
  }

  if (drawPositions) {
    // if projectedWinningSide is present then a TEAM matchUp is being directed, not the tieMatchUp
    const winningIndex = projectedWinningSide
      ? projectedWinningSide - 1
      : winningSide - 1;
    const losingIndex = projectedWinningSide
      ? 1 - projectedWinningSide
      : 1 - winningIndex;

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
        sourceMatchUpStatus:
          (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
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
        sourceMatchUpStatus:
          (matchUpStatusIsValid && matchUpStatus) || COMPLETED,
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
      const backdrawPosition = Math.min(
        ...targetMatchUpDrawPositions.filter(Boolean)
      );
      const targetStructureId = byeTargetLink.target.structureId;
      const result = assignDrawPositionBye({
        drawPosition: backdrawPosition,
        structureId: targetStructureId,
        tournamentRecord,
        drawDefinition,
      });
      if (result.error) return decorateResult({ result, stack });
    }
  } else {
    return decorateResult({ result: { error: MISSING_DRAW_POSITIONS }, stack });
  }

  return decorateResult({ result: { ...SUCCESS }, stack });
}

function drawPositionsAssignedParticipantIds({ structure, matchUp }) {
  const { drawPositions } = matchUp;
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const assignedParticipantIds = positionAssignments.filter((assignment) => {
    return (
      drawPositions?.includes(assignment.drawPosition) &&
      assignment.participantId
    );
  });
  return assignedParticipantIds.length === 2;
}
