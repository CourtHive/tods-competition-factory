import { scoreHasValue } from '../../../matchUpEngine/governors/queryGovernor/scoreHasValue';
import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getProjectedDualWinningSide } from './getProjectedDualWinningSide';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { decorateResult } from '../../../global/functions/decorateResult';
import { validateScore } from '../../../global/validation/validateScore';
import { positionTargets } from '../positionGovernor/positionTargets';
import { noDownstreamDependencies } from './noDownstreamDependencies';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../getters/findStructure';
import { updateTieMatchUpScore } from './tieMatchUpScore';
import { isActiveDownstream } from './isActiveDownstream';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addMatchUpScheduleItems } from './scheduleItems';
import { swapWinnerLoser } from './swapWinnerLoser';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';

import { POLICY_TYPE_PROGRESSION } from '../../../constants/policyConstants';
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
  DOUBLE_WALKOVER,
  INCOMPLETE,
  particicipantsRequiredMatchUpStatuses,
  TO_BE_PLAYED,
  validMatchUpStatuses,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

/**
 *
 * @param {string} drawDefinition - required to collect all draw matchUps for scenario analysis
 * @param {string} matchUpId - id of the matchUp to be modified
 * @param {object} score - score object { sets: [] }
 * @param {string} matchUpStatus - optional - new matchUpStatus
 * @param {number} winningSide - optional - new winningSide; 1 or 2
 * @param {object} tournamentRecord - optional - used to discover relevant policyDefinitions or to modify scheduling information (integrity checks)
 * @returns
 */

// WOULDBENICE: return object containing all modified { matchUpIds, structureIds, drawIds }
export function setMatchUpStatus(params) {
  const stack = 'setMatchUpStatus';

  // always clear score if DOUBLE_WALKOVER or WALKOVER
  if ([WALKOVER, DOUBLE_WALKOVER].includes(params.matchUpStatus))
    params.score = undefined;

  // matchUpStatus in params is the new status
  // winningSide in params is new winningSide

  const {
    allowChangePropagation,
    disableScoreValidation,
    tournamentRecords,
    tournamentRecord,
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

  // Get map of all drawMatchUps and inContextDrawMatchUPs ---------------------
  const matchUpsMap = getMatchUpsMap({ drawDefinition });
  let { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    includeByeMatchUps: true,
    nextMatchUps: true,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });

  // Find target matchUp ------------------------------------------------------
  const matchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  const inContextMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  if (!matchUp || !inContextDrawMatchUps) return { error: MATCHUP_NOT_FOUND };

  if ((matchUp.winningSide || winningSide) && matchUpStatus === BYE) {
    return { error: INCOMPATIBLE_MATCHUP_STATUS, matchUpStatus };
  }

  // Check validity of matchUpStatus considering assigned drawPositions -------
  const assignedDrawPositions = inContextMatchUp.drawPositions?.filter(Boolean);

  if (matchUp.matchUpType === TEAM) {
    if (
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
        info: 'Not supported for machUpType: TEAM',
      };
    }
  }

  const matchUpTieId = inContextMatchUp.matchUpTieId;

  // Get winner/loser position targets ----------------------------------------
  const targetData = positionTargets({
    matchUpId: matchUpTieId || matchUpId, // get targets for TEAM matchUp if tieMatchUp
    inContextDrawMatchUps,
    drawDefinition,
  });

  const structureId = inContextMatchUp.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });

  if (score && matchUp.matchUpType !== TEAM && !disableScoreValidation) {
    const matchUpFormat =
      matchUp.matchUpFormat ||
      structure?.matchUpFormat ||
      drawDefinition?.matchUpFormat ||
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

  const bothSideParticipants =
    matchUp.sides?.map((side) => side.participantId).filter(Boolean).length ===
      2 || assignedDrawPositions?.length === 2;

  if (
    matchUpStatus &&
    particicipantsRequiredMatchUpStatuses.includes(matchUpStatus) &&
    !bothSideParticipants
  ) {
    return decorateResult({
      result: { error: INVALID_MATCHUP_STATUS },
      info: 'present in participantRequiredMatchUpStatuses',
      context: { matchUpStatus, bothSideParticipants },
    });
  }

  const { appliedPolicies } = getAppliedPolicies({
    policyTypes: [POLICY_TYPE_PROGRESSION],
    tournamentRecord,
    drawDefinition,
    event,
  });

  Object.assign(params, {
    inContextDrawMatchUps,
    inContextMatchUp,
    appliedPolicies,
    matchUpTieId,
    matchUpsMap,
    targetData,
    structure,
    matchUp,
  });

  let dualWinningSideChange;
  if (matchUpTieId) {
    const { matchUp: dualMatchUp } = findMatchUp({
      matchUpId: matchUpTieId,
      inContext: true,
      drawDefinition,
      matchUpsMap,
      event,
    });
    const tieFormat =
      dualMatchUp?.tieFormat ||
      structure?.tieFormat ||
      drawDefinition?.tieFormat ||
      event?.tieFormat ||
      undefined;

    const { projectedWinningSide } = getProjectedDualWinningSide({
      winningSide,
      dualMatchUp,
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

  // with propagating winningSide changes, activeDownstream only applies to eventType: TEAM
  const activeDownstream = isActiveDownstream(params);
  const directingMatchUpStatus = isDirectingMatchUpStatus({ matchUpStatus });

  if (!matchUpTieId) {
    if (
      activeDownstream &&
      !winningSide &&
      isNonDirectingMatchUpStatus({ matchUpStatus })
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

  const validWinningSideChange =
    matchUp.matchUpType !== TEAM &&
    !dualWinningSideChange &&
    winningSide &&
    matchUp.winningSide &&
    matchUp.winningSide !== winningSide;

  if (
    allowChangePropagation &&
    validWinningSideChange &&
    matchUp.roundPosition // not round robin if matchUp.roundPosition
  ) {
    return swapWinnerLoser(params);
  }

  const matchUpWinner =
    (winningSide && !matchUpTieId) || params.projectedWinningSide;

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
      result: { error: CANNOT_CHANGE_WINNING_SIDE },
      stack: 'winningSideWithDownstreamDependencies',
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
    !scoreHasValue({ score: params.score });
  const newMatchUpStatus = params.isCollectionMatchUp
    ? params.machUpStatus || (removeWinningSide && TO_BE_PLAYED)
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

  // recalculate dualMatchUp score if isCollectionMatchUp
  if (params.isCollectionMatchUp) {
    const { matchUpTieId, drawDefinition } = params;
    const { removeWinningSide } = updateTieMatchUpScore({
      matchUpId: matchUpTieId,
      tournamentRecord,
      drawDefinition,
      event,
    });
    console.log('sms', { removeWinningSide });
  }

  return result;
}
