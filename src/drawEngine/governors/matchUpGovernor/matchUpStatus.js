import { findMatchUp } from '../../getters/getMatchUps';
import { positionTargets } from '..//positionGovernor/positionTargets';

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

  // prep for score objects which may be added to TODS
  if (props?.score && typeof props.score === 'string') {
    props.scoreString = props.score;
  }

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
      drawDefinition,
      sourceMatchUpWinnerDrawPositionIndex,
    });
    Object.assign(props, { matchUp, structure, targetData });
    const {
      targetMatchUps: { loserMatchUp, winnerMatchUp },
    } = targetData;

    // if neither loserMatchUp or winnerMatchUp have winningSide
    // => score matchUp and advance participants along links
    const loserMatchUpHasWinningSide = loserMatchUp?.winningSide;
    const winnerMatchUpHasWinningSide = winnerMatchUp?.winningSide;
    const activeDownstream =
      loserMatchUpHasWinningSide || winnerMatchUpHasWinningSide;

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
      console.log('no valid actions', { props });
      errors.push({ error: NO_VALID_ACTIONS });
    }
  }

  return errors.length
    ? { error: { errors } }
    : Object.assign({}, SUCCESS, { matchUp });
}

function attemptStatusChange(props) {
  const errors = [];
  const { matchUp, matchUpStatus } = props;

  if (!Object.values(matchUpStatusConstants).includes(matchUpStatus)) {
    errors.push({ error: INVALID_MATCHUP_STATUS });
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
      const { score, sets } = props;

      if (score) matchUp.score = score;
      if (sets) matchUp.sets = sets;
      // TESTED
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
  const { matchUp, matchUpStatus, matchUpStatusCodes, score, sets } = props;
  matchUp.matchUpStatus = matchUpStatus || COMPLETED;
  matchUp.matchUpStatusCodes = matchUpStatusCodes;
  if (score) matchUp.score = score;
  if (sets) matchUp.sets = sets;
}
