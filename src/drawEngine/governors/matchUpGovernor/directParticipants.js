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

  const matchUpStatusIsValid = isDirectingMatchUpStatus({ matchUpStatus });

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
      structure,
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
    const winningIndex = winningSide - 1;
    const losingIndex = 1 - winningIndex;

    const winningDrawPosition = drawPositions[winningIndex];
    const loserDrawPosition = drawPositions[losingIndex];

    const {
      targetLinks: { loserTargetLink, winnerTargetLink },
      targetMatchUps: {
        winnerMatchUpDrawPositionIndex,
        loserMatchUpDrawPositionIndex,
        winnerMatchUp,
        loserMatchUp,
      },
    } = targetData;

    if (winnerMatchUp) {
      const result = directWinner({
        winnerMatchUpDrawPositionIndex,
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
        loserMatchUpDrawPositionIndex,
        inContextDrawMatchUps,
        projectedWinningSide,
        loserDrawPosition,
        tournamentRecord,
        loserTargetLink,
        drawDefinition,
        matchUpStatus,
        loserMatchUp,
        winningSide,
        matchUpsMap,
        dualMatchUp,
        event,
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
