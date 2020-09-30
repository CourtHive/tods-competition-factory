import { findMatchUp } from '../../getters/getMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getMatchUpLinks, getTargetLink } from '../../getters/linkGetter';

import { LOSER, WINNER } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';

import { positionActions } from './positionActions';
import { isDirectingMatchUpStatus } from '../matchUpGovernor/checkStatusType';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';

/*
  return an array of all possible validActions for a given matchUp
*/
export function matchUpActions({ drawDefinition, matchUpId }) {
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
  });
  const {
    assignedPositions,
    allPositionsAssigned,
  } = structureAssignedDrawPositions({ structure });
  const { drawPositions } = matchUp || {};
  const { structureId } = structure || {};

  const validActions = [];
  if (!structureId) return { validActions };

  const participantAssignedDrawPositions = assignedPositions
    .filter(assignment => assignment.participantId)
    .map(assignment => assignment.drawPosition);

  const byeAssignedDrawPositions = assignedPositions
    .filter(assignment => assignment.bye)
    .map(assignment => assignment.drawPosition);

  const isCollectionMatchUp = matchUp.collectionId;
  const isByeMatchUp =
    matchUp.matchUpStatus === BYE ||
    (!isCollectionMatchUp &&
      matchUp.drawPositions.reduce((isByeMatchUp, drawPosition) => {
        return byeAssignedDrawPositions.includes(drawPosition) || isByeMatchUp;
      }, false));

  const matchDrawPositionsAreAssigned =
    drawPositions &&
    drawPositions.length &&
    drawPositions.reduce(
      (assignedBoolean, drawPosition) =>
        participantAssignedDrawPositions.includes(drawPosition) &&
        assignedBoolean,
      true
    );

  const {
    links: { source },
  } = getMatchUpLinks({ drawDefinition, matchUp, structureId });
  const loserTargetLink = getTargetLink({ source, subject: LOSER });
  const winnerTargetLink = getTargetLink({ source, subject: WINNER });

  if (loserTargetLink || winnerTargetLink) {
    console.log({ source, loserTargetLink, winnerTargetLink });
  }

  if (isByeMatchUp) {
    const nonByeDrawPosition = matchUp.drawPositions.reduce(
      (nonByeDrawPosition, drawPosition) => {
        return !byeAssignedDrawPositions.includes(drawPosition)
          ? drawPosition
          : nonByeDrawPosition;
      },
      undefined
    );

    const participantId = assignedPositions.reduce(
      (participantId, assignment) => {
        return assignment.drawPosition === nonByeDrawPosition
          ? assignment.participantId
          : participantId;
      },
      undefined
    );

    if (participantId) {
      return positionActions({
        drawDefinition,
        participantId,
        structureId,
        drawPosition: nonByeDrawPosition,
      });
    } else {
      return { validActions, isByeMatchUp };
    }
  } else {
    validActions.push({ type: 'REFEREE' });
    const isInComplete = !isDirectingMatchUpStatus({
      matchUpStatus: matchUp.matchUpStatus,
    });
    const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
    const structureScoringPolicies = appliedPolicies?.scoring?.structures;
    const stageSpecificPolicies =
      structureScoringPolicies?.stage &&
      structureScoringPolicies?.stage[structure.stage];
    const sequenceSpecificPolicies =
      stageSpecificPolicies?.stageSequence &&
      stageSpecificPolicies.stageSequence[structure.stageSequence];
    const requireAllPositionsAssigned =
      appliedPolicies?.scoring?.requireAllPositionsAssigned ||
      stageSpecificPolicies?.requireAllPositionsAssigned ||
      sequenceSpecificPolicies?.requireAllPositionsAssigned;
    const scoringActive = !requireAllPositionsAssigned || allPositionsAssigned;

    const hasParticipants =
      matchUp.Sides &&
      matchUp.Sides.filter(side => side && side.participantId).length === 2;

    const readyToScore = matchDrawPositionsAreAssigned || hasParticipants;

    if (isInComplete && !isByeMatchUp) {
      validActions.push({ type: 'SCHEDULE' });
    }
    if (isInComplete && readyToScore && !isByeMatchUp) {
      validActions.push({ type: 'PENALTY' });
      validActions.push({ type: 'STATUS' });
    }
    if (scoringActive && readyToScore && !isByeMatchUp) {
      validActions.push({ type: 'SCORE' });
      validActions.push({ type: 'PENALTY' });
      validActions.push({ type: 'START' });
      validActions.push({ type: 'END' });
    }
  }
  return { validActions, isByeMatchUp };
}
