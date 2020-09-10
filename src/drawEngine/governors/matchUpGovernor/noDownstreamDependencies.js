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

export function noDownstreamDependencies(props) {
  const { matchUp, matchUpStatus, score, winningSide } = props;
  let errors = [];

  if (winningSide) {
    const { errors: winningSideErrors } = attemptToSetWinningSide(props);
    if (winningSideErrors) errors = errors.concat(winningSideErrors);
  } else if (matchUpStatus) {
    const { errors: matchUpStatusErrors } = attemptToSetMatchUpStatus(props);
    if (matchUpStatusErrors) errors = errors.concat(matchUpStatusErrors);
  } else if (!winningSide && score) {
    const { errors: incompleteScoreErrors } = attemptToSetIncompleteScore(
      props
    );
    if (incompleteScoreErrors) errors = errors.concat(incompleteScoreErrors);
  } else if (!winningSide && matchUp.winningSide && !score) {
    const { errors: participantDirectionErrors } = removeDirectedParticipants(
      props
    );
    if (participantDirectionErrors) {
      errors = errors.concat(participantDirectionErrors);
      return { errors };
    }
  } else {
    delete matchUp.score;
    delete matchUp.sets;
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
  const { matchUp, score, sets } = props;
  const errors = [];

  if (score) matchUp.score = score;
  if (sets) matchUp.sets = sets;
  delete matchUp.winningSide;
  matchUp.matchUpStatus = INCOMPLETE;

  const isCollectionMatchUp = Boolean(matchUp.collectionId);
  if (isCollectionMatchUp) {
    const { drawDefinition, matchUpTieId } = props;
    updateTieMatchUpScore({ drawDefinition, matchUpId: matchUpTieId });
  }

  return { errors };
}

function attemptToSetWinningSide(props) {
  const { matchUp, matchUpStatus, winningSide } = props;
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
      // TESTED
    } else {
      // determine appropriate matchUpStatus;
      matchUp.matchUpStatus = COMPLETED;
      // TESTED
    }
  }

  return { errors };
}

function attemptToSetMatchUpStatus(props) {
  const { matchUp, structure, matchUpStatus } = props;
  let errors = [];

  if (matchUp.winningSide) {
    if (matchUpStatus === BYE) {
      errors.push({ error: 'matchUpStatus cannot be set to BYE' });
      // TESTED
    } else if (isDirectingMatchUpStatus({ matchUpStatus })) {
      matchUp.matchUpStatus = matchUpStatus;
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
      errors.push({ error: 'Unknown matchUpStatus' });
      // TESTED
    }
  } else if (isNonDirectingMatchUpStatus({ matchUpStatus })) {
    matchUp.matchUpStatus = matchUpStatus;
    // TESTED
  } else if (matchUpStatus === BYE) {
    // It is not possible to change matchUp status to BYE unless
    // matchUp.drawPositions includes BYE assigned position
    const { positionAssignments } = structureAssignedDrawPositions({
      structure,
    });

    const byeAssignedDrawPositions = positionAssignments
      .filter(assignment => assignment.bye)
      .map(assignment => assignment.drawPosition);
    const matchUpIncludesBye = matchUp.drawPositions.reduce(
      (includesBye, position) => {
        return byeAssignedDrawPositions.includes(position) ? true : includesBye;
      },
      undefined
    );

    if (matchUpIncludesBye) {
      matchUp.matchUpStatus = matchUpStatus;
      // TESTED
    } else {
      errors.push({ error: 'matchUp must include BYE assigned drawPosition' });
      // TESTED
    }
  } else {
    if (isDirectingMatchUpStatus({ matchUpStatus })) {
      errors.push({ error: 'Invalid matchUpStatus: no winningSide' });
      // TESTED
    } else {
      errors.push({ error: 'Unnkown matchUpStatus' });
      // TESTED
    }
  }

  return { errors };
}
