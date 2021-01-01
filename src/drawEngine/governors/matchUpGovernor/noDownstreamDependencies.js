import { directParticipants } from './directParticipants';
import { removeDirectedParticipants } from './removeDirectedParticipants';
import {
  isDirectingMatchUpStatus,
  isNonDirectingMatchUpStatus,
} from './checkStatusType';
import { updateTieMatchUpScore } from '../../accessors/matchUpAccessor/tieMatchUpScore';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';

import {
  BYE,
  COMPLETED,
  INCOMPLETE,
} from '../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_MATCHUP_STATUS,
  UNRECOGNIZED_MATCHUP_STATUS,
} from '../../../constants/errorConditionConstants';

export function noDownstreamDependencies(props) {
  const { matchUp, matchUpStatus, score, winningSide } = props;
  let errors = [];

  if (winningSide) {
    const { errors: winningSideErrors } = attemptToSetWinningSide(props);
    if (winningSideErrors) errors = errors.concat(winningSideErrors);
  } else if (matchUpStatus) {
    const { errors: matchUpStatusErrors } = attemptToSetMatchUpStatus(props);
    if (matchUpStatusErrors) errors = errors.concat(matchUpStatusErrors);
  } else if (!winningSide && score?.sets?.length) {
    const { errors: incompleteScoreErrors } = attemptToSetIncompleteScore(
      props
    );
    if (incompleteScoreErrors) errors = errors.concat(incompleteScoreErrors);
  } else if (!winningSide && matchUp.winningSide && !score?.sets?.length) {
    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );
    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  } else {
    delete matchUp.score;
    delete matchUp.matchUpStatus;
    delete matchUp.winningSide;
    const isCollectionMatchUp = Boolean(matchUp.collectionId);
    if (isCollectionMatchUp) {
      const { drawDefinition, matchUpTieId } = props;
      updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
    }
  }

  return errors.length ? { errors } : SUCCESS;
}

function attemptToSetIncompleteScore(props) {
  const { matchUp, score } = props;
  const errors = [];

  if (score) matchUp.score = score;
  delete matchUp.winningSide;
  matchUp.matchUpStatus = INCOMPLETE;
  matchUp.matchUpStatusCodes = [];

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    const { drawDefinition, matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
  }

  return { errors };
}

function attemptToSetWinningSide(props) {
  const { matchUp, matchUpStatus, matchUpStatusCodes, winningSide } = props;
  let errors = [];

  if (matchUp.winningSide && matchUp.winningSide !== winningSide) {
    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );

    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  }

  // TESTED
  const { errors: participantDirectionErrors } = directParticipants(props);

  if (participantDirectionErrors) {
    errors = errors.concat(participantDirectionErrors);
    // TESTED
  } else {
    // check that matchUpStatus is not incompatible with winningSide
    if (matchUpStatus && isDirectingMatchUpStatus({ matchUpStatus })) {
      matchUp.matchUpStatus = matchUpStatus || COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatus && matchUpStatusCodes;
      // TESTED
    } else {
      // determine appropriate matchUpStatus;
      matchUp.matchUpStatus = COMPLETED;
      matchUp.matchUpStatusCodes = matchUpStatusCodes;
      // TESTED
    }
  }

  return { errors };
}

function attemptToSetMatchUpStatus(props) {
  const { matchUp, structure, matchUpStatus, matchUpStatusCodes } = props;
  let errors = [];

  if (matchUp.winningSide) {
    if (matchUpStatus === BYE) {
      errors.push({ error: INVALID_MATCHUP_STATUS, matchUpStatus });
      // TESTED
    } else if (isDirectingMatchUpStatus({ matchUpStatus })) {
      matchUp.matchUpStatus = matchUpStatus;
      matchUp.matchUpStatusCodes = matchUpStatusCodes;
      // TESTED
    } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
      // only possible to remove winningSide if neither winner
      // nor loser has been directed further into target structures
      const { errors: participantDirectionErrors } = removeDirectedParticipants(
        props
      );

      if (participantDirectionErrors) {
        errors = errors.concat(participantDirectionErrors);
      }
      // TESTED
    } else {
      errors.push({ error: UNRECOGNIZED_MATCHUP_STATUS });
      // TESTED
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    matchUp.matchUpStatus = matchUpStatus;
    matchUp.matchUpStatusCodes = matchUpStatusCodes;
    // TESTED
  } else if (matchUpStatus === BYE) {
    // It is not possible to change matchUp status to BYE unless
    // matchUp.drawPositions includes BYE assigned position
    const { positionAssignments } = structureAssignedDrawPositions({
      structure,
    });

    const byeAssignedDrawPositions = positionAssignments
      .filter((assignment) => assignment.bye)
      .map((assignment) => assignment.drawPosition);
    const matchUpIncludesBye = matchUp.drawPositions?.reduce(
      (includesBye, position) => {
        return byeAssignedDrawPositions.includes(position) ? true : includesBye;
      },
      undefined
    );

    if (matchUpIncludesBye) {
      matchUp.matchUpStatus = matchUpStatus;
      matchUp.matchUpStatusCodes = [];
      // TESTED
    } else {
      errors.push({ error: INVALID_MATCHUP_STATUS, matchUpStatus });
      // TESTED
    }
  } else {
    if (isDirectingMatchUpStatus({ matchUpStatus })) {
      errors.push({ error: INVALID_MATCHUP_STATUS, matchUpStatus });
      // TESTED
    } else {
      errors.push({ error: UNRECOGNIZED_MATCHUP_STATUS });
      // TESTED
    }
  }

  return { errors };
}
