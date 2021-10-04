import { getProjectedDualWinningWide } from './getProjectedDualWinningSide';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionTargets } from '../positionGovernor/positionTargets';
import { noDownstreamDependencies } from './noDownstreamDependencies';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { getDevContext } from '../../../global/globalState';
import { findStructure } from '../../getters/findStructure';
import { isActiveDownstream } from './isActiveDownstream';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addMatchUpScheduleItems } from './scheduleItems';
import { swapWinnerLoser } from './swapWinnerLoser';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';

import { BYE, COMPLETED } from '../../../constants/matchUpStatusConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  ABANDONED,
  CANCELLED,
  INCOMPLETE,
  TO_BE_PLAYED,
  particicipantsRequiredMatchUpStatuses,
  validMatchUpStatuses,
} from '../../../constants/matchUpStatusConstants';
import {
  INVALID_MATCHUP_STATUS,
  MATCHUP_NOT_FOUND,
  MISSING_DRAW_DEFINITION,
  NO_VALID_ACTIONS,
  INVALID_VALUES,
  INCOMPATIBLE_MATCHUP_STATUS,
  CANNOT_CHANGE_WINNINGSIDE,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {string} drawDefinition - required to collect all draw matchUps for scenario analysis
 * @param {string} matchUpId - id of the matchUp to be modified
 * @param {string} matchUpStatus - optional - new matchUpStatus
 * @param {number} winningSide - optional - new winningSide; 1 or 2
 * @param {object} tournamentRecord - optional - used to discover relevant policyDefinitions or to modify scheduling information (integrity checks)
 * @returns
 */

// WOULDBENICE: return object containing all modified { matchUpIds, structureIds, drawIds }
export function setMatchUpStatus(params) {
  // matchUpStatus in params is the new status
  // winningSide in params is new winningSide
  const {
    drawDefinition,
    matchUpId,
    matchUpStatus,
    tournamentRecord,
    winningSide,
    allowChangePropagation = undefined, // factory default
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
    return { error: INVALID_MATCHUP_STATUS };
  }

  // Get map of all drawMatchUps and inContextDrawMatchUPs ---------------------
  const matchUpsMap = getMatchUpsMap({ drawDefinition });
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    includeByeMatchUps: true,
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
    return { error: INCOMPATIBLE_MATCHUP_STATUS };
  }

  // Check validity of matchUpStatus considering assigned drawPositions -------
  const assignedDrawPositions = inContextMatchUp.drawPositions?.filter(Boolean);

  if (
    matchUpStatus &&
    particicipantsRequiredMatchUpStatuses.includes(matchUpStatus) &&
    (!assignedDrawPositions || assignedDrawPositions?.length < 2)
  ) {
    return { error: INVALID_MATCHUP_STATUS };
  }

  if (matchUp.matchUpType === TEAM) {
    // do not direclty set team score... unless walkover/default/double walkover/Retirement
    return { error: 'DIRECT SCORING of TEAM matchUp not implemented' };
  }

  const matchUpTieId = inContextMatchUp.matchUpTieId;

  // Get winner/loser position targets ----------------------------------------
  const targetData = positionTargets({
    matchUpId: matchUpTieId || matchUpId, // get targets for TEAM matchUp if tieMatchUp
    drawDefinition,
    inContextDrawMatchUps,
  });

  let dualWinningSideChange;
  if (matchUpTieId) {
    const { matchUp: dualMatchUp } = findMatchUp({
      drawDefinition,
      matchUpId: matchUpTieId,

      matchUpsMap,
    });
    const tieFormat = dualMatchUp.tieFormat || drawDefinition.tieFormat;

    const { projectedWinningSide } = getProjectedDualWinningWide({
      matchUp,
      winningSide,
      dualMatchUp,
      tieFormat,
    });

    const existingDualMatchUpWinningSide = dualMatchUp.winningSide;
    dualWinningSideChange =
      projectedWinningSide !== existingDualMatchUpWinningSide;

    if (dualWinningSideChange) {
      if (getDevContext({ tieMatchUps: true }))
        console.log('dualMatchUp', { projectedWinningSide });
    }
  }

  // Add scheduling information to matchUp ------------------------------------
  const { schedule } = params;
  if (schedule) {
    const result = addMatchUpScheduleItems({
      tournamentRecord,
      disableNotice: true,
      drawDefinition,
      matchUpId,
      schedule,
    });
    if (result.error) {
      return result;
    }
  }

  // if there is a TEAM matchUp, assign it instead of the tieMatchUp ??
  const structureId = inContextMatchUp.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });

  Object.assign(params, {
    matchUp,
    inContextMatchUp,
    matchUpTieId,
    structure,
    targetData,

    matchUpsMap,
    inContextDrawMatchUps,
  });

  // with propagating winningSide changes, activeDownstream only applies to eventType: TEAM
  const activeDownstream = isActiveDownstream(params);
  if (
    activeDownstream &&
    !winningSide &&
    isNonDirectingMatchUpStatus({ matchUpStatus })
  ) {
    return { error: INCOMPATIBLE_MATCHUP_STATUS };
  }

  const directingMatchUpStatus = isDirectingMatchUpStatus({ matchUpStatus });

  if (
    winningSide &&
    winningSide === matchUp.winningSide &&
    matchUpStatus &&
    !directingMatchUpStatus
  ) {
    return { error: INCOMPATIBLE_MATCHUP_STATUS };
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

  const result = (!activeDownstream && noDownstreamDependencies(params)) ||
    (winningSide && winningSideWithDownstreamDependencies(params)) ||
    (directingMatchUpStatus && applyMatchUpValues(params)) || {
      error: NO_VALID_ACTIONS,
    };

  return result;
}

function winningSideWithDownstreamDependencies(params) {
  const { matchUp, winningSide } = params;
  if (winningSide === matchUp.winningSide) {
    return applyMatchUpValues(params);
  } else {
    return { error: CANNOT_CHANGE_WINNINGSIDE };
  }
}

function applyMatchUpValues(params) {
  return modifyMatchUpScore({
    ...params,
    matchUpStatus: params.matchUpStatus || COMPLETED,
  });
}
