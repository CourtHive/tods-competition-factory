import { getProjectedDualWinningWide } from './getProjectedDualWinningSide';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionTargets } from '../positionGovernor/positionTargets';
import { noDownstreamDependencies } from './noDownstreamDependencies';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { getDevContext } from '../../../global/globalState';
import { findStructure } from '../../getters/findStructure';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addMatchUpScheduleItems } from './scheduleItems';
import { isActiveDownstream } from './isActiveDownstream';
import { makeDeepCopy } from '../../../utilities';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';

import { BYE, COMPLETED } from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
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

export function setMatchUpStatus(params) {
  let messages = [];

  // matchUpStatus in params is the new status
  // winningSide in params is new winningSide
  const {
    drawDefinition,
    matchUpId,
    matchUpStatus,
    tournamentRecord,
    winningSide,
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
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,

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

  // const directingMatchUpStatus = isDirectingMatchUpStatus({ matchUpStatus });
  if (matchUp.winningSide && matchUpStatus === BYE) {
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
  const structureId = inContextMatchUp.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });

  // Get winner/loser position targets ----------------------------------------
  const targetData = positionTargets({
    matchUpId: matchUpTieId || matchUpId, // get targets for TEAM matchUp if tieMatchUp
    structure,
    drawDefinition,
    inContextDrawMatchUps,
  });

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
    if (projectedWinningSide !== existingDualMatchUpWinningSide) {
      if (getDevContext()) console.log('dualMatchUp', { projectedWinningSide });
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
  Object.assign(params, {
    matchUp,
    inContextDrawMatchUps,
    matchUpTieId,
    structure,
    targetData,

    matchUpsMap,
  });

  // with propagating winningSide changes, activeDownStream only applies to eventType: TEAM
  const activeDownStream = isActiveDownstream({ inContextMatchUp, targetData });

  const result = (!activeDownStream && noDownstreamDependencies(params)) ||
    (winningSide && winningSideWithDownstreamDependencies(params)) ||
    (matchUpStatus && attemptStatusChange(params)) || {
      error: NO_VALID_ACTIONS,
    };

  if (result.error) return result;

  return getDevContext()
    ? {
        ...SUCCESS,
        matchUp: makeDeepCopy(matchUp),
        messages,
      }
    : SUCCESS;
}

function attemptStatusChange(params) {
  const { matchUpStatus } = params;

  // if no winningSide is given and matchUp has winningSide
  // check whether intent is to remove winningSide
  if (isDirectingMatchUpStatus({ matchUpStatus })) {
    applyMatchUpValues(params);
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    return { error: INCOMPATIBLE_MATCHUP_STATUS };
  }
  return SUCCESS;
}

function winningSideWithDownstreamDependencies(params) {
  const {
    matchUp,
    matchUpStatus,
    winningSide,
    notes,
    matchUpId,
    tournamentRecord,
    event,
  } = params;

  if (winningSide === matchUp.winningSide) {
    if (matchUpStatus) {
      if (
        isDirectingMatchUpStatus({ matchUpStatus }) &&
        matchUpStatus !== BYE
      ) {
        applyMatchUpValues(params);
      } else {
        // matchUpStatus can't be changed to something non-directing
        return {
          error:
            'Cannot change matchUpStatus to nonDirecting outcome with winningSide',
        };
      }
    } else {
      const { drawDefinition, score, matchUpFormat, matchUpTieId } = params;
      modifyMatchUpScore({
        tournamentRecord,
        drawDefinition,
        matchUpFormat,
        matchUpId,
        matchUp,
        score,
        notes,
        event,
        matchUpTieId,
      });
    }
  } else {
    return { error: 'Cannot change winner with advanced participants' };
    // TODO POLICY:
    // check whether winningSide can be changed
    // or change winning side with rippple effect to all downstream matchUps
  }

  return SUCCESS;
}

function applyMatchUpValues(params) {
  const {
    tournamentRecord,
    drawDefinition,
    matchUpStatusCodes,
    matchUpStatus,
    matchUpFormat,
    matchUpId,
    matchUp,
    event,
    score,
    notes,
  } = params;
  modifyMatchUpScore({
    tournamentRecord,
    drawDefinition,
    matchUpStatus: matchUpStatus || COMPLETED,
    matchUpStatusCodes,
    matchUpFormat,
    matchUpId,
    matchUp,
    event,
    score,
    notes,
    matchUpTieId: params.matchUpTieId,
  });
}
