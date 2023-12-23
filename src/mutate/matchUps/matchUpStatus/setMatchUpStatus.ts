import { ensureSideLineUps } from '../lineUps/ensureSideLineUps';
import { resolveTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/getTieFormat/resolveTieFormat';
import { removeExtension } from '../../extensions/removeExtension';
import { generateTieMatchUpScore } from '../../../assemblies/generators/tieMatchUpScore/generateTieMatchUpScore';
import { checkScoreHasValue } from '../../../query/matchUp/checkScoreHasValue';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { addExtension } from '../../extensions/addExtension';
import { getProjectedDualWinningSide } from '../../../drawEngine/governors/matchUpGovernor/getProjectedDualWinningSide';
import { getAllDrawMatchUps } from '../../../query/drawMatchUps';
import { findDrawMatchUp } from '../../../acquire/findDrawMatchUp';
import { getMatchUpsMap } from '../../../query/matchUps/getMatchUpsMap';
import { decorateResult } from '../../../global/functions/decorateResult';
import { validateScore } from '../../../validators/validateScore';
import { getPositionAssignments } from '../../../query/drawDefinition/positionsGetter';
import { positionTargets } from '../drawPositions/positionTargets';
import { noDownstreamDependencies } from '../../../drawEngine/governors/matchUpGovernor/noDownstreamDependencies';
import { pushGlobalLog } from '../../../global/functions/globalLog';
import { findStructure } from '../../../acquire/findStructure';
import { updateTieMatchUpScore } from '../score/tieMatchUpScore';
import { isActiveDownstream } from '../../../drawEngine/governors/matchUpGovernor/isActiveDownstream';
import { modifyMatchUpScore } from '../score/modifyMatchUpScore';
import { addMatchUpScheduleItems } from '../schedule/scheduleItems';
import { swapWinnerLoser } from '../drawPositions/swapWinnerLoser';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from '../../../drawEngine/governors/matchUpGovernor/checkStatusType';

import { POLICY_TYPE_PROGRESSION } from '../../../constants/policyConstants';
import { DISABLE_AUTO_CALC } from '../../../constants/extensionConstants';
import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { PolicyDefinitions } from '../../../types/factoryTypes';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  CANNOT_CHANGE_WINNING_SIDE,
  INCOMPATIBLE_MATCHUP_STATUS,
  INVALID_MATCHUP_STATUS,
  INVALID_VALUES,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  NO_VALID_ACTIONS,
} from '../../../constants/errorConditionConstants';
import {
  ABANDONED,
  AWAITING_RESULT,
  BYE,
  CANCELLED,
  COMPLETED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  INCOMPLETE,
  particicipantsRequiredMatchUpStatuses,
  TO_BE_PLAYED,
  validMatchUpStatuses,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  DrawDefinition,
  Event,
  MatchUpStatusUnion,
  Tournament,
} from '../../../types/tournamentTypes';

// WOULDBENICE: return object containing all modified { matchUpIds, structureIds, drawIds }

type SetMatchUpStatusArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  policyDefinitions?: PolicyDefinitions;
  matchUpStatus?: MatchUpStatusUnion;
  allowChangePropagation?: boolean;
  disableScoreValidation?: boolean;
  projectedWinningSide?: number;
  matchUpStatusCodes?: string[];
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  disableAutoCalc?: boolean;
  enableAutoCalc?: boolean;
  matchUpFormat?: string;
  matchUpTieId?: string;
  tieMatchUpId?: string;
  removeScore?: boolean;
  winningSide?: number;
  matchUpId: string;
  schedule?: any;
  notes?: string;
  outcome?: any;
  event?: Event;
  score?: any;
};

export function setMatchUpStatus(params: SetMatchUpStatusArgs): any {
  const stack = 'setMatchUpStatus';

  // always clear score if DOUBLE_WALKOVER or WALKOVER
  if (
    params.matchUpStatus &&
    [WALKOVER, DOUBLE_WALKOVER].includes(params.matchUpStatus)
  )
    params.score = undefined;

  // matchUpStatus in params is the new status
  // winningSide in params is new winningSide

  const {
    allowChangePropagation,
    disableScoreValidation,
    tournamentRecords,
    tournamentRecord,
    disableAutoCalc,
    enableAutoCalc,
    drawDefinition,
    matchUpStatus,
    winningSide,
    matchUpId,
    event,
    score,
  } = params;

  // Check for missing parameters ---------------------------------------------
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  // Check matchUpStatus, matchUpStatus/winningSide validity ------------------
  if (
    matchUpStatus &&
    [CANCELLED, INCOMPLETE, ABANDONED, TO_BE_PLAYED].includes(matchUpStatus) &&
    winningSide
  )
    return { error: INVALID_VALUES, winningSide, matchUpStatus };

  if (![undefined, ...validMatchUpStatuses].includes(matchUpStatus)) {
    return decorateResult({
      result: { error: INVALID_MATCHUP_STATUS },
      info: 'matchUpStatus does not exist',
      stack: 'setMatchUpStatus',
    });
  }

  // Get map of all drawMatchUps and inContextDrawMatchUps ---------------------
  const matchUpsMap = getMatchUpsMap({ drawDefinition });
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    nextMatchUps: true,
    inContext: true,
    drawDefinition,
    matchUpsMap,
    event,
  });

  // Find target matchUp ------------------------------------------------------
  const matchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  const inContextMatchUp = inContextDrawMatchUps?.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  if (!matchUp || !inContextDrawMatchUps) return { error: MATCHUP_NOT_FOUND };

  if ((matchUp.winningSide || winningSide) && matchUpStatus === BYE) {
    return {
      context: 'Cannot have Bye with winningSide',
      error: INCOMPATIBLE_MATCHUP_STATUS,
      matchUpStatus,
    };
  }

  const structureId = inContextMatchUp?.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });

  // Check validity of matchUpStatus considering assigned drawPositions -------
  const assignedDrawPositions =
    inContextMatchUp?.drawPositions?.filter(Boolean);

  let dualWinningSideChange;
  if (matchUp.matchUpType === TEAM) {
    if (disableAutoCalc) {
      addExtension({
        extension: { name: DISABLE_AUTO_CALC, value: true },
        element: matchUp,
      });
    } else if (enableAutoCalc) {
      const existingDualMatchUpWinningSide = matchUp.winningSide;
      removeExtension({ name: DISABLE_AUTO_CALC, element: matchUp });
      const {
        winningSide: projectedWinningSide,
        scoreStringSide1,
        scoreStringSide2,
        set,
      } = generateTieMatchUpScore({
        drawDefinition,
        matchUpsMap,
        structure,
        matchUp,
        event,
      });

      const score = {
        scoreStringSide1,
        scoreStringSide2,
        sets: set ? [set] : [],
      };

      dualWinningSideChange =
        projectedWinningSide !== existingDualMatchUpWinningSide;

      // setting these parameters will enable noDownStreamDependencies to attemptToSetWinningSide
      Object.assign(params, {
        winningSide: projectedWinningSide,
        dualWinningSideChange,
        projectedWinningSide,
        score,
      });
    }
    ensureSideLineUps({
      tournamentId: tournamentRecord?.tournamentId,
      inContextDualMatchUp: inContextMatchUp,
      eventId: event?.eventId,
      drawDefinition,
      dualMatchUp: matchUp,
    });
  }

  if (
    matchUp.matchUpType === TEAM &&
    matchUpStatus &&
    [
      AWAITING_RESULT,
      // for the following statuses should all tieMatchUp results be removed?
      // CANCELLED,
      // DOUBLE_WALKOVER,
      // WALKOVER,
    ].includes(matchUpStatus)
  ) {
    return {
      error: INVALID_VALUES,
      info: 'Not supported for matchUpType: TEAM',
    };
  }

  const matchUpTieId = inContextMatchUp?.matchUpTieId;

  // Get winner/loser position targets ----------------------------------------
  const targetData = positionTargets({
    matchUpId: matchUpTieId || matchUpId, // get targets for TEAM matchUp if tieMatchUp
    inContextDrawMatchUps,
    drawDefinition,
  });

  if (score && matchUp.matchUpType !== TEAM && !disableScoreValidation) {
    const matchUpFormat =
      matchUp.matchUpFormat ??
      structure?.matchUpFormat ??
      drawDefinition?.matchUpFormat ??
      event?.matchUpFormat;

    const result = validateScore({
      existingMatchUpStatus: matchUp.matchUpStatus,
      matchUpFormat,
      matchUpStatus,
      winningSide,
      score,
    });
    if (result.error) {
      return result;
    }
  }

  const positionAssignments = !matchUp?.sides
    ? getPositionAssignments({
        drawDefinition,
        structureId,
      }).positionAssignments
    : [];

  const bothSideParticipants =
    matchUp.sides?.map((side) => side.participantId).filter(Boolean).length ===
      2 ||
    (assignedDrawPositions?.length === 2 &&
      positionAssignments
        ?.filter((assignment) =>
          assignedDrawPositions.includes(assignment.drawPosition)
        )
        .every((assignment) => assignment.participantId));

  if (
    matchUpStatus &&
    particicipantsRequiredMatchUpStatuses.includes(matchUpStatus) &&
    !bothSideParticipants
  ) {
    return decorateResult({
      info: 'present in participantRequiredMatchUpStatuses',
      context: { matchUpStatus, bothSideParticipants },
      result: { error: INVALID_MATCHUP_STATUS },
    });
  }

  const appliedPolicies =
    getAppliedPolicies({
      policyTypes: [POLICY_TYPE_PROGRESSION],
      tournamentRecord,
      drawDefinition,
      event,
    })?.appliedPolicies ?? {};

  if (typeof params.policyDefinitions === 'object') {
    Object.assign(appliedPolicies, params.policyDefinitions);
  }

  const qualifyingMatch =
    inContextMatchUp?.stage === QUALIFYING &&
    inContextMatchUp.finishingRound === 1;
  const qualifierAdvancing = qualifyingMatch && winningSide;
  const removingQualifier =
    qualifyingMatch && // oop
    matchUp.winningSide &&
    !winningSide && // function calls last
    (!params.matchUpStatus ||
      (params.matchUpStatus &&
        isNonDirectingMatchUpStatus({
          matchUpStatus: params.matchUpStatus,
        }))) &&
    (!params.outcome || !checkScoreHasValue({ outcome: params.outcome }));
  const qualifierChanging =
    qualifierAdvancing && // oop
    winningSide !== matchUp.winningSide &&
    matchUp.winningSide;

  Object.assign(params, {
    inContextDrawMatchUps,
    qualifierAdvancing,
    qualifierChanging,
    removingQualifier,
    inContextMatchUp,
    appliedPolicies,
    matchUpTieId,
    matchUpsMap,
    targetData,
    structure,
    matchUp,
  });

  if (matchUpTieId) {
    const { matchUp: dualMatchUp } = findDrawMatchUp({
      matchUpId: matchUpTieId,
      inContext: true,
      drawDefinition,
      matchUpsMap,
      event,
    });
    if (dualMatchUp) {
      const tieFormat = resolveTieFormat({
        matchUp: dualMatchUp,
        drawDefinition,
        structure,
        event,
      })?.tieFormat;

      const { projectedWinningSide } = getProjectedDualWinningSide({
        drawDefinition,
        matchUpStatus,
        dualMatchUp,
        matchUpsMap,
        winningSide,
        tieFormat,
        structure,
        matchUp,
        event,
        score,
      });

      const existingDualMatchUpWinningSide = dualMatchUp.winningSide;
      dualWinningSideChange =
        projectedWinningSide !== existingDualMatchUpWinningSide;

      Object.assign(params, {
        isCollectionMatchUp: true,
        dualWinningSideChange,
        projectedWinningSide,
        matchUpTieId,
        dualMatchUp,
        tieFormat,
      });
    }
  }

  // with propagating winningSide changes, activeDownstream does not apply to collection matchUps
  const activeDownstream = isActiveDownstream(params);
  const directingMatchUpStatus = isDirectingMatchUpStatus({ matchUpStatus });

  if (!matchUpTieId) {
    if (
      activeDownstream &&
      !winningSide &&
      ((matchUpStatus && isNonDirectingMatchUpStatus({ matchUpStatus })) ||
        (matchUpStatus &&
          [DOUBLE_WALKOVER, DOUBLE_DEFAULT].includes(matchUpStatus)))
    ) {
      return {
        error: INCOMPATIBLE_MATCHUP_STATUS,
        activeDownstream,
        winningSide,
      };
    }

    if (
      winningSide &&
      winningSide === matchUp.winningSide &&
      matchUpStatus &&
      !directingMatchUpStatus
    ) {
      return {
        context: 'winningSide must include directing matchUpStatus',
        error: INCOMPATIBLE_MATCHUP_STATUS,
        directingMatchUpStatus,
        matchUpStatus,
      };
    }
  }

  // Add scheduling information to matchUp ------------------------------------
  const { schedule } = params;
  if (schedule) {
    const result = addMatchUpScheduleItems({
      disableNotice: true,
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      matchUpId,
      schedule,
    });
    if (result.error) {
      return result;
    }
  }

  const validWinningSideSwap =
    matchUp.matchUpType !== TEAM &&
    !dualWinningSideChange &&
    winningSide &&
    matchUp.winningSide &&
    matchUp.winningSide !== winningSide;

  if (
    allowChangePropagation &&
    validWinningSideSwap &&
    matchUp.roundPosition // not round robin if matchUp.roundPosition
  ) {
    return swapWinnerLoser(params);
  }

  const matchUpWinner =
    (winningSide && !matchUpTieId) || params.projectedWinningSide;

  pushGlobalLog({
    method: stack,
    activeDownstream,
    matchUpWinner,
    winningSide,
  });

  const result = (!activeDownstream && noDownstreamDependencies(params)) ||
    (matchUpWinner && winningSideWithDownstreamDependencies(params)) ||
    (directingMatchUpStatus && applyMatchUpValues(params)) || {
      error: NO_VALID_ACTIONS,
    };

  return decorateResult({ result, stack });
}

function winningSideWithDownstreamDependencies(params) {
  const { matchUp, winningSide, matchUpTieId, dualWinningSideChange } = params;
  if (
    winningSide === matchUp.winningSide ||
    (matchUpTieId && !dualWinningSideChange)
  ) {
    return applyMatchUpValues(params);
  } else {
    return decorateResult({
      stack: 'winningSideWithDownstreamDependencies',
      result: { error: CANNOT_CHANGE_WINNING_SIDE },
      context: { winningSide, matchUp },
    });
  }
}

function applyMatchUpValues(params) {
  const { tournamentRecord, matchUp, event } = params;
  const removeWinningSide =
    params.isCollectionMatchUp &&
    matchUp.winningSide &&
    !params.winningSide &&
    !checkScoreHasValue({ score: params.score });
  const newMatchUpStatus = params.isCollectionMatchUp
    ? params.matchUpStatus || (removeWinningSide && TO_BE_PLAYED) || COMPLETED
    : params.matchUpStatus || COMPLETED;
  const removeScore =
    params.removeScore ||
    ([CANCELLED, WALKOVER].includes(newMatchUpStatus) &&
      ![INCOMPLETE, ABANDONED].includes(newMatchUpStatus));

  const result = modifyMatchUpScore({
    ...params,
    matchUpStatus: newMatchUpStatus,
    removeWinningSide,
    removeScore,
  });
  if (result.error) return result;

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (params.isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition, matchUpsMap } = params;
    const tieMatchUpResult = updateTieMatchUpScore({
      matchUpId: matchUpTieId,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      event,
    });

    if (tieMatchUpResult.error) return tieMatchUpResult;
    Object.assign(result, { tieMatchUpResult });
  }

  return result;
}
