import { findMatchUp } from '../../getters/getMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { getRoundLinks, getTargetLink } from '../../getters/linkGetter';
import { positionActions } from './positionActions';
import { isDirectingMatchUpStatus } from '../matchUpGovernor/checkStatusType';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';

import { LOSER, WINNER } from '../../../constants/drawDefinitionConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';

import { ADD_PENALTY } from '../../../constants/positionActionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';

/*
  return an array of all possible validActions for a given matchUp
*/
export function matchUpActions({ drawDefinition, matchUpId }) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

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
    .filter((assignment) => assignment.participantId)
    .map((assignment) => assignment.drawPosition);

  const byeAssignedDrawPositions = assignedPositions
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const isCollectionMatchUp = matchUp.collectionId;
  const isByeMatchUp =
    matchUp.matchUpStatus === BYE ||
    (!isCollectionMatchUp &&
      matchUp.drawPositions?.reduce((isByeMatchUp, drawPosition) => {
        return byeAssignedDrawPositions.includes(drawPosition) || isByeMatchUp;
      }, false));

  const matchDrawPositionsAreAssigned = drawPositions?.reduce(
    (assignedBoolean, drawPosition) =>
      participantAssignedDrawPositions.includes(drawPosition) &&
      assignedBoolean,
    true
  );

  const {
    links: { source },
  } = getRoundLinks({
    drawDefinition,
    roundNumber: matchUp.roundNumber,
    structureId,
  });
  const loserTargetLink = getTargetLink({ source, subject: LOSER });
  const winnerTargetLink = getTargetLink({ source, subject: WINNER });

  if (loserTargetLink || winnerTargetLink) {
    console.log({ source, loserTargetLink, winnerTargetLink });
  }

  if (isByeMatchUp) {
    const nonByeDrawPosition = matchUp.drawPositions?.reduce(
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
      matchUp.sides &&
      matchUp.sides.filter((side) => side && side.participantId).length === 2;

    const readyToScore = matchDrawPositionsAreAssigned || hasParticipants;

    if (isInComplete && !isByeMatchUp) {
      validActions.push({ type: 'SCHEDULE' });
    }
    if (isInComplete && readyToScore && !isByeMatchUp) {
      validActions.push({ type: ADD_PENALTY });
      validActions.push({ type: 'STATUS' });
    }
    if (scoringActive && readyToScore && !isByeMatchUp) {
      validActions.push({ type: 'SCORE' });
      validActions.push({ type: ADD_PENALTY });
      validActions.push({ type: 'START' });
      validActions.push({ type: 'END' });
    }
  }
  return { validActions, isByeMatchUp };
}
