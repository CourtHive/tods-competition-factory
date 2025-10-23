import { attemptToSetMatchUpStatusBYE } from '@Mutate/matchUps/matchUpStatus/attemptToSetMatchUpStatusBYE';
import { propagateExitStatusToBackdraw } from './propagateExitStatusToBackdraw';
import { isDirectingMatchUpStatus, isNonDirectingMatchUpStatus } from '@Query/matchUp/checkStatusType';
import { removeDirectedParticipants } from '@Mutate/matchUps/drawPositions/removeDirectedParticipants';
import { doubleExitAdvancement } from '@Mutate/drawDefinitions/positionGovernor/doubleExitAdvancement';
import { updateTieMatchUpScore } from '@Mutate/matchUps/score/updateTieMatchUpScore';
import { modifyMatchUpScore } from '@Mutate/matchUps/score/modifyMatchUpScore';
import { decorateResult } from '@Functions/global/decorateResult';

// constants
import { INVALID_MATCHUP_STATUS, UNRECOGNIZED_MATCHUP_STATUS } from '@Constants/errorConditionConstants';
import {
  BYE,
  CANCELLED,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  RETIRED,
  TO_BE_PLAYED,
  WALKOVER,
} from '@Constants/matchUpStatusConstants';
import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FEED_IN_CHAMPIONSHIP_TO_QF,
  FEED_IN_CHAMPIONSHIP_TO_R16,
  FEED_IN_CHAMPIONSHIP_TO_SF,
  FIRST_MATCH_LOSER_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
  VOLUNTARY_CONSOLATION,
} from '@Constants/drawDefinitionConstants';

export function attemptToSetMatchUpStatus(params) {
  const {
    tournamentRecord,
    drawDefinition,
    matchUpStatus,
    structure,
    matchUp,
    event,
    allowBackdrawParticipation,
    propagateExitStatusToBackdraw: propagateExitStatusToBackdrawFlag,
  } = params;

  // Propagate exit status to backdraw if relevant
  const EXIT_STATUSES = [WALKOVER, RETIRED, DEFAULTED];
  const APPLICABLE_DRAWS_FOR_BACKDRAW_PROPAGATION = [
    COMPASS,
    FIRST_MATCH_LOSER_CONSOLATION,
    CURTIS_CONSOLATION,
    FEED_IN_CHAMPIONSHIP_TO_QF,
    FEED_IN_CHAMPIONSHIP_TO_SF,
    FEED_IN_CHAMPIONSHIP_TO_R16,
    VOLUNTARY_CONSOLATION,
    MODIFIED_FEED_IN_CHAMPIONSHIP,
    FEED_IN_CHAMPIONSHIP,
  ];
  if (
    matchUpStatus &&
    EXIT_STATUSES.includes(matchUpStatus) &&
    APPLICABLE_DRAWS_FOR_BACKDRAW_PROPAGATION.includes(drawDefinition?.drawType) &&
    matchUp?.sides &&
    propagateExitStatusToBackdrawFlag
  ) {
    // Find the losing participantId
    const losingSide = matchUp.sides.find(
      (side) => side && side.participantId && (!side.winner || side.winner === false),
    );
    if (losingSide && losingSide.participantId) {
      propagateExitStatusToBackdraw({
        tournamentRecord,
        drawDefinition,
        losingParticipantId: losingSide.participantId,
        matchUpStatus,
        event,
        allowBackdrawParticipation,
      });
    }
  }

  const teamRoundRobinContext = !!(
    matchUp.tieMatchUps &&
    !matchUp.rondPosition &&
    params.inContextDrawMatchUps.find((icdm) => icdm.matchUpId === matchUp.matchUpId).containerStructureId
  );

  const stack = 'attemptToSetMatchUpStatus';

  const isBYE = matchUpStatus === BYE;
  const existingWinningSide = matchUp.winningSide;
  const isDoubleExit = [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUpStatus);

  const directing = isDirectingMatchUpStatus({ matchUpStatus });
  const nonDirecting = isNonDirectingMatchUpStatus({ matchUpStatus });
  const unrecognized = !directing && !nonDirecting;

  // if matchUpTieId present a TEAM matchUp is being modified...
  const onlyModifyScore = params.matchUpTieId || (existingWinningSide && directing && !isDoubleExit);

  const changeCompletedToDoubleExit = existingWinningSide && isDoubleExit;

  const clearScore = () =>
    modifyMatchUpScore({
      ...params,
      removeScore: [CANCELLED, WALKOVER].includes(matchUpStatus),
      matchUpStatus: matchUpStatus || TO_BE_PLAYED,
    });

  return (
    (unrecognized && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (onlyModifyScore && scoreModification(params)) ||
    (changeCompletedToDoubleExit && removeWinningSideAndSetDoubleExit(params)) ||
    (existingWinningSide && removeDirectedParticipants(params)) ||
    (nonDirecting && clearScore()) ||
    (isBYE &&
      attemptToSetMatchUpStatusBYE({
        tournamentRecord,
        drawDefinition,
        structure,
        matchUp,
      })) ||
    (!directing && { error: UNRECOGNIZED_MATCHUP_STATUS }) ||
    (isDoubleExit && modifyScoreAndAdvanceDoubleExit(params)) ||
    (teamRoundRobinContext && scoreModification(params)) ||
    decorateResult({
      result: { error: INVALID_MATCHUP_STATUS },
      stack,
    })
  );
}

function removeWinningSideAndSetDoubleExit(params) {
  const result = removeDirectedParticipants(params);
  if (result.error) return result;
  return doubleExitAdvancement(params);
}

function modifyScoreAndAdvanceDoubleExit(params) {
  const result = scoreModification({ ...params, removeScore: true });
  if (result.error) return result;
  return doubleExitAdvancement(params);
}

function scoreModification(params) {
  const stack = 'scoreModification';

  const removeDirected = params.isCollectionMatchUp && params.dualMatchUp?.winningSide && !params.projectedWinningSide;

  if (removeDirected) {
    const result = removeDirectedParticipants(params);
    if (result.error) return decorateResult({ result, stack });
  }
  const isCollectionMatchUp = Boolean(params.matchUp.collectionId);
  const result = modifyMatchUpScore({ ...params, context: stack });

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition, matchUpsMap } = params;
    const tieMatchUpResult = updateTieMatchUpScore({
      tournamentRecord: params.tournamentRecord,
      appliedPolicies: params.appliedPolicies,
      matchUpId: matchUpTieId,
      event: params.event,
      drawDefinition,
      matchUpsMap,
    });
    if (tieMatchUpResult.error) {
      return decorateResult({ result: tieMatchUpResult, stack });
    }
    Object.assign(result, { tieMatchUpResult });
  }

  return decorateResult({ result, stack });
}
