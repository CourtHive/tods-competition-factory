import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
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
  particicipantsRequiredMatchUpStatuses,
  TO_BE_PLAYED,
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

export function setMatchUpStatus(props) {
  let messages = [];

  // matchUpStatus in props is the new status
  // winningSide in props is new winningSide
  const { drawDefinition, matchUpId, matchUpStatus, winningSide } = props;
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
  Object.assign(props, { mappedMatchUps });

  // cannot take matchUpStatus from existing matchUp records
  // cannot take winningSide from existing matchUp records
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    mappedMatchUps,
    matchUpId,
  });

  if (!matchUp) return { error: MATCHUP_NOT_FOUND };

  const assignedDrawPositions = matchUp.drawPositions.filter((f) => f);
  if (
    matchUpStatus &&
    particicipantsRequiredMatchUpStatuses.includes(matchUpStatus) &&
    assignedDrawPositions.length < 2
  ) {
    return { error: INVALID_MATCHUP_STATUS };
  }

  const { schedule } = props;
  if (schedule) {
    const result = addMatchUpScheduleItems({
      disableNotice: true,
      drawDefinition,
      matchUpId,
      schedule,
    });
    if (result.error) return result;
  }

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    mappedMatchUps,
    includeByeMatchUps: true,
  });

  Object.assign(props, { mappedMatchUps, inContextDrawMatchUps });

  const targetData = positionTargets({
    matchUpId,
    structure,
    drawDefinition,
    mappedMatchUps,
    inContextDrawMatchUps,
  });
  Object.assign(props, { matchUp, structure, targetData });

  const {
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = targetData;

  // if neither loserMatchUp or winnerMatchUp have winningSide
  // => score matchUp and advance participants along links
  const inContextMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
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
    const { errors: noDependenciesErrors, message } = noDownstreamDependencies(
      props
    );
    if (message) messages.push(message);
    if (noDependenciesErrors)
      return { error: { errors: noDependenciesErrors } };
  } else if (winningSide) {
    const {
      errors: winnerWithDependencyErrors,
    } = winningSideWithDownstreamDependencies(props);
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
  const { matchUp, matchUpStatus, winningSide, notes } = props;

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
      const { drawDefinition, score } = props;
      modifyMatchUpScore({ drawDefinition, matchUp, score, notes });
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
    matchUp,
    matchUpStatus,
    matchUpStatusCodes,
    score,
    notes,
  } = props;
  modifyMatchUpScore({
    drawDefinition,
    matchUp,
    matchUpStatus: matchUpStatus || COMPLETED,
    matchUpStatusCodes,
    score,
    notes,
  });
}
