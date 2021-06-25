import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { generateTieMatchUpScore } from '../../accessors/matchUpAccessor';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionTargets } from '../positionGovernor/positionTargets';
import { noDownstreamDependencies } from './noDownstreamDependencies';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { intersection, makeDeepCopy } from '../../../utilities';
import { getDevContext } from '../../../global/globalState';
import { modifyMatchUpScore } from './modifyMatchUpScore';
import { addMatchUpScheduleItems } from './scheduleItems';
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

  const mappedMatchUps = getMatchUpsMap({ drawDefinition });

  // cannot take matchUpStatus from existing matchUp records
  // cannot take winningSide from existing matchUp records
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    mappedMatchUps,
    matchUpId,
  });

  if (matchUp.matchUpType === TEAM) {
    // do not direclty set team score... unless walkover/default/double walkover/Retirement
    return { error: 'DIRECT SCORING of TEAM matchUp not implemented' };
  }

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

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

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    mappedMatchUps,
    includeByeMatchUps: true,
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
  const targetData = positionTargets({
    matchUpId: matchUpTieId || matchUpId, // get targets for TEAM matchUp if tieMatchUp
    structure,
    drawDefinition,
    mappedMatchUps,
    inContextDrawMatchUps,
  });

  if (matchUpTieId) {
    const { matchUp: teamMatchUp } = findMatchUp({
      drawDefinition,
      mappedMatchUps,
      matchUpId: matchUpTieId,
    });
    const existingTieMatchUpWinningSide = matchUp.winningSide;
    let sideAdjustments = [0, 0];
    if (winningSide === 1 && existingTieMatchUpWinningSide === 2) {
      sideAdjustments = [-1, 1];
    } else if (winningSide === 2 && existingTieMatchUpWinningSide === 1) {
      sideAdjustments = [1, -1];
    } else if (winningSide && !existingTieMatchUpWinningSide) {
      if (winningSide === 1) {
        sideAdjustments = [1, 0];
      } else {
        sideAdjustments = [0, 1];
      }
      // !winningSide is insufficient for recognizing if a winningSide is being removed
      // matchUpStatus is not a completed status?
    } else if (existingTieMatchUpWinningSide && !winningSide) {
      //
    }

    const existingTeamMatchUpWinningSide = teamMatchUp.winningSide;
    const tieFormat = teamMatchUp.tieFormat || drawDefinition.tieFormat;
    const { winningSide: projectedWinningSide } = generateTieMatchUpScore({
      matchUp: teamMatchUp,
      tieFormat,
      sideAdjustments,
    });
    if (projectedWinningSide !== existingTeamMatchUpWinningSide) {
      console.log('teamMatchUp', { projectedWinningSide });
    }
  }
  // if there is a TEAM matchUp, assign it instead of the tieMatchUp ??
  Object.assign(props, {
    matchUp,
    mappedMatchUps,
    inContextDrawMatchUps,
    matchUpTieId,
    structure,
    targetData,
  });

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  // if neither loserMatchUp or winnerMatchUp have winningSide
  // => score matchUp and advance participants along links
  const matchUpParticipantIds =
    inContextMatchUp?.sides?.map(({ participantId }) => participantId) || [];
  const loserMatchUpHasWinningSide = loserMatchUp?.winningSide;
  const loserMatchUpParticipantIds =
    loserMatchUp?.sides?.map(({ participantId }) => participantId) || [];
  const loserMatchUpParticipantIntersection = !!intersection(
    matchUpParticipantIds,
    loserMatchUpParticipantIds
  ).length;
  const winnerMatchUpHasWinningSide = winnerMatchUp?.winningSide;
  const winnerMatchUpParticipantIds =
    winnerMatchUp?.sides?.map(({ participantId }) => participantId) || [];
  const winnerMatchUpParticipantIntersection = !!intersection(
    matchUpParticipantIds,
    winnerMatchUpParticipantIds
  ).length;

  const activeDownstream =
    (loserMatchUpHasWinningSide && loserMatchUpParticipantIntersection) ||
    (winnerMatchUpHasWinningSide && winnerMatchUpParticipantIntersection);

  // if either lowerMatchUp or winnerMatchUp have winningSide
  // => see if either matchUp has active players
  // => if active players are present then outcome cannot change
  // => if outcome is NOT different, apply new result information

  if (!activeDownstream) {
    // not activeDownstream also handles changing the winner of a finalRound
    // as long as the matchUp is not the finalRound of a qualifying structure
    const { errors: noDependenciesErrors, message } =
      noDownstreamDependencies(props);
    if (message) messages.push(message);
    if (noDependenciesErrors) return { error: noDependenciesErrors[0] };
  } else if (winningSide) {
    const { errors: winnerWithDependencyErrors } =
      winningSideWithDownstreamDependencies(props);
    if (winnerWithDependencyErrors)
      return { error: { errors: winnerWithDependencyErrors } };
  } else if (matchUpStatus) {
    const { errors: statusChangeErrors, message } = attemptStatusChange(props);
    if (message) messages.push(message);
    if (statusChangeErrors) return { error: { errors: statusChangeErrors } };
  } else {
    if (getDevContext()) {
      console.log('no valid actions', {
        props,
        loserMatchUpParticipantIds,
        winnerMatchUpParticipantIds,
      });
    }
    return { error: NO_VALID_ACTIONS };
  }

  return getDevContext()
    ? Object.assign({}, SUCCESS, {
        matchUp: makeDeepCopy(matchUp),
        messages,
      })
    : SUCCESS;
}

function attemptStatusChange(props) {
  const { matchUp, matchUpStatus } = props;

  if (!Object.values(matchUpStatusConstants).includes(matchUpStatus)) {
    return { errors: [{ error: INVALID_MATCHUP_STATUS, matchUpStatus }] };
  }

  // if no winningSide is given and matchUp has winningSide
  // check whether intent is to remove winningSide
  if (isDirectingMatchUpStatus({ matchUpStatus })) {
    if (matchUp.winningSide && matchUpStatus !== BYE) {
      applyMatchUpValues(props);
      // TESTED
    } else {
      return {
        errors: [
          {
            error: 'matchUp with winningSide cannot have matchUpStatus: BYE',
          },
        ],
      };
      // TESTED
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    return {
      errors: [
        {
          error: 'matchUp has winner; cannot apply non-directing matchUpStatus',
        },
      ],
    };
    // TESTED
  }
  return SUCCESS;
}

function winningSideWithDownstreamDependencies(props) {
  const { matchUp, matchUpStatus, winningSide, notes, matchUpId } = props;

  if (winningSide === matchUp.winningSide) {
    if (matchUpStatus) {
      if (
        isDirectingMatchUpStatus({ matchUpStatus }) &&
        matchUpStatus !== BYE
      ) {
        applyMatchUpValues(props);
        // TESTED
      } else {
        // matchUpStatus can't be changed to something non-directing
        return {
          errors: [
            {
              error:
                'Cannot change matchUpStatus to nonDirecting outcome with winningSide',
            },
          ],
        };
        // TESTED
      }
    } else {
      const { drawDefinition, score, matchUpFormat, matchUpTieId } = props;
      modifyMatchUpScore({
        drawDefinition,
        matchUpFormat,
        matchUpId,
        matchUp,
        score,
        notes,
        matchUpTieId,
      });
    }
  } else {
    return {
      errors: [{ error: 'Cannot change winner with advanced participants' }],
    };
    // TODO POLICY:
    // check whether winningSide can be changed
    // or change winning side with rippple effect to all downstream matchUps
    // TESTED
  }

  return SUCCESS;
}

function applyMatchUpValues(props) {
  const {
    drawDefinition,
    matchUpStatusCodes,
    matchUpStatus,
    matchUpFormat,
    matchUpId,
    matchUp,
    score,
    notes,
  } = props;
  modifyMatchUpScore({
    drawDefinition,
    matchUpStatus: matchUpStatus || COMPLETED,
    matchUpStatusCodes,
    matchUpFormat,
    matchUpId,
    matchUp,
    score,
    notes,
    matchUpTieId: props.matchUpTieId,
  });
}
