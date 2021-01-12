import { findMatchUp, getAllDrawMatchUps } from '../../getters/getMatchUps';
import { positionTargets } from '../positionGovernor/positionTargets';
import { intersection, makeDeepCopy } from '../../../utilities';

import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';
import { noDownstreamDependencies } from './noDownstreamDependencies';

import {
  INVALID_MATCHUP_STATUS,
  MATCHUP_NOT_FOUND,
  NO_VALID_ACTIONS,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  COMPLETED,
  matchUpStatusConstants,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function setMatchUpStatus(props) {
  let errors = [];

  // matchUpStatus in props is the new status
  // winningSide in props is new winningSide
  const { drawDefinition, matchUpId, matchUpStatus, winningSide } = props;

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  // cannot take matchUpStatus from existing matchUp records
  // cannot take winningSide from existing matchUp records
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
  });

  if (!matchUp) {
    errors.push({ error: MATCHUP_NOT_FOUND });
  } else {
    const sourceMatchUpWinnerDrawPositionIndex =
      winningSide && 1 - (2 - winningSide);
    const targetData = positionTargets({
      matchUpId,
      structure,
      drawDefinition,
      inContextDrawMatchUps,
      sourceMatchUpWinnerDrawPositionIndex,
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

    // TODO: This activeDownstream boolean works in every case EXCEPT 2nd round of MAIN structure in FMLC…
    // need to expand the check to see if the participants in the matchUp in question are actually participants
    // in the loserMatchUp that has a winningSide because ONLY in FMLC 2nd round there is the possibility that
    // a player who lost did not go to the loserMatchUp

    // if either lowerMatchUp or winnerMatchUp have winningSide
    // => see if either matchUp has active players
    // => if active players are present then outcome cannot change
    // => if outcome is NOT different, apply new result information

    if (!activeDownstream) {
      // not activeDownstream also handles changing the winner of a finalRound
      // as long as the matchUp is not the finalRound of a qualifying structure
      const { errors: noDependenciesErrors } = noDownstreamDependencies(props);
      if (noDependenciesErrors) errors = errors.concat(noDependenciesErrors);
    } else if (winningSide) {
      const {
        errors: winnerWithDependencyErrors,
      } = winningSideWithDownstreamDependencies(props);
      if (winnerWithDependencyErrors)
        errors = errors.concat(winnerWithDependencyErrors);
    } else if (matchUpStatus) {
      const { errors: statusChangeErrors } = attemptStatusChange(props);
      if (statusChangeErrors) errors = errors.concat(statusChangeErrors);
    } else {
      console.log('no valid actions', {
        props,
        loserMatchUpParticipantIds,
        winnerMatchUpParticipantIds,
      });
      errors.push({ error: NO_VALID_ACTIONS });
    }
  }

  return errors.length
    ? { error: { errors } }
    : Object.assign({}, SUCCESS, { matchUp: makeDeepCopy(matchUp) });
}

function attemptStatusChange(props) {
  const errors = [];
  const { matchUp, matchUpStatus } = props;

  if (!Object.values(matchUpStatusConstants).includes(matchUpStatus)) {
    errors.push({ error: INVALID_MATCHUP_STATUS, matchUpStatus });
  }

  // if no winningSide is given and matchUp has winningSide
  // check whether intent is to remove winningSide
  if (isDirectingMatchUpStatus({ matchUpStatus })) {
    if (matchUp.winningSide && matchUpStatus !== BYE) {
      applyMatchUpValues(props);
      // TESTED
    } else {
      errors.push({
        error: 'matchUp with winningSide cannot have matchUpStatus: BYE',
      });
      // TESTED
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    errors.push({
      error: 'matchUp has winner; cannot apply non-directing matchUpStatus',
    });
    // TESTED
  }
  return errors.length ? { errors } : SUCCESS;
}

function winningSideWithDownstreamDependencies(props) {
  const errors = [];
  const { matchUp, matchUpStatus, winningSide } = props;

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
        errors.push({
          error:
            'Cannot change matchUpStatus to nonDirecting outcome with winningSide',
        });
        // TESTED
      }
    } else {
      const { score } = props;
      if (score) matchUp.score = score;
    }
  } else {
    errors.push({ error: 'Cannot change winner with advanced participants' });
    // TODO POLICY:
    // check whether winningSide can be changed
    // or change winning side with rippple effect to all downstream matchUps
    // TESTED
  }

  return errors.length ? { errors } : SUCCESS;
}

function applyMatchUpValues(props) {
  const { matchUp, matchUpStatus, matchUpStatusCodes, score } = props;
  matchUp.matchUpStatus = matchUpStatus || COMPLETED;
  matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (score) matchUp.score = score;
}
