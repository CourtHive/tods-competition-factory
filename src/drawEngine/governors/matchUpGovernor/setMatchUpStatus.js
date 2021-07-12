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
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  COMPLETED,
  matchUpStatusConstants,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';

/**
 *
 * @param {string} drawDefinition - required to collect all draw matchUps for scenario analysis
 * @param {string} matchUpId - id of the matchUp to be modified
 * @param {string} matchUpStatus - optional - new matchUpStatus
 * @param {number} winningSide - optional - new winningSide; 1 or 2
 * @param {object} tournamentRecord - optional - used to discover relevant policyDefinitions or to modify scheduling information (integrity checks)
 * @returns
 */

export function setMatchUpStatus(props) {
  let messages = [];

  // matchUpStatus in props is the new status
  // winningSide in props is new winningSide
  const {
    drawDefinition,
    matchUpId,
    matchUpStatus,
    tournamentRecord,
    winningSide,
  } = props;

  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  if (
    [CANCELLED, INCOMPLETE, ABANDONED, TO_BE_PLAYED].includes(matchUpStatus) &&
    winningSide
  )
    return { error: INVALID_VALUES, winningSide, matchUpStatus };

  if (![undefined, ...validMatchUpStatuses].includes(matchUpStatus)) {
    return { error: INVALID_MATCHUP_STATUS };
  }

  const matchUpsMap = getMatchUpsMap({ drawDefinition });

  // cannot take matchUpStatus from existing matchUp records
  // cannot take winningSide from existing matchUp records

  const matchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  if (matchUp.matchUpType === TEAM) {
    // do not direclty set team score... unless walkover/default/double walkover/Retirement
    return { error: 'DIRECT SCORING of TEAM matchUp not implemented' };
  }

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,

    matchUpsMap,
  });

  const inContextMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  const assignedDrawPositions = inContextMatchUp?.drawPositions?.filter(
    (f) => f
  );

  if (
    matchUpStatus &&
    particicipantsRequiredMatchUpStatuses.includes(matchUpStatus) &&
    (!assignedDrawPositions || assignedDrawPositions?.length < 2)
  ) {
    return { error: INVALID_MATCHUP_STATUS };
  }

  const matchUpTieId = inContextMatchUp.matchUpTieId;
  const structureId = inContextMatchUp.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });

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
  } else {
    const { schedule } = props;
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
  }

  // if there is a TEAM matchUp, assign it instead of the tieMatchUp ??
  Object.assign(props, {
    matchUp,
    inContextDrawMatchUps,
    matchUpTieId,
    structure,
    targetData,

    matchUpsMap,
  });

  // if either lowerMatchUp or winnerMatchUp have winningSide
  // => see if either matchUp has active players
  // => if active players are present then outcome cannot change
  // => if outcome is NOT different, apply new result information

  if (!isActiveDownstream({ inContextMatchUp, targetData })) {
    // not activeDownstream also handles changing the winner of a finalRound
    // as long as the matchUp is not the finalRound of a qualifying structure
    const result = noDownstreamDependencies(props);
    if (result.error) return result;
  } else if (winningSide) {
    const result = winningSideWithDownstreamDependencies(props);
    if (result.error) return result;
  } else if (matchUpStatus) {
    const result = attemptStatusChange(props);
    if (result.error) return result;
  } else {
    if (getDevContext()) {
      console.log('no valid actions');
    }
    return { error: NO_VALID_ACTIONS };
  }

  return getDevContext()
    ? {
        ...SUCCESS,
        matchUp: makeDeepCopy(matchUp),
        messages,
      }
    : SUCCESS;
}

function attemptStatusChange(props) {
  const { matchUp, matchUpStatus } = props;

  if (!Object.values(matchUpStatusConstants).includes(matchUpStatus)) {
    return { error: INVALID_MATCHUP_STATUS, matchUpStatus };
  }

  // if no winningSide is given and matchUp has winningSide
  // check whether intent is to remove winningSide
  if (isDirectingMatchUpStatus({ matchUpStatus })) {
    if (matchUp.winningSide && matchUpStatus !== BYE) {
      applyMatchUpValues(props);
    } else {
      return {
        error: 'matchUp with winningSide cannot have matchUpStatus: BYE',
      };
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    return {
      error: 'matchUp has winner; cannot apply non-directing matchUpStatus',
    };
  }
  return SUCCESS;
}

function winningSideWithDownstreamDependencies(props) {
  const {
    matchUp,
    matchUpStatus,
    winningSide,
    notes,
    matchUpId,
    tournamentRecord,
    event,
  } = props;

  if (winningSide === matchUp.winningSide) {
    if (matchUpStatus) {
      if (
        isDirectingMatchUpStatus({ matchUpStatus }) &&
        matchUpStatus !== BYE
      ) {
        applyMatchUpValues(props);
      } else {
        // matchUpStatus can't be changed to something non-directing
        return {
          error:
            'Cannot change matchUpStatus to nonDirecting outcome with winningSide',
        };
      }
    } else {
      const { drawDefinition, score, matchUpFormat, matchUpTieId } = props;
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

function applyMatchUpValues(props) {
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
  } = props;
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
    matchUpTieId: props.matchUpTieId,
  });
}
