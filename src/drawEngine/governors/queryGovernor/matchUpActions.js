import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { isDirectingMatchUpStatus } from '../matchUpGovernor/checkStatusType';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { isActiveDownstream } from '../matchUpGovernor/isActiveDownstream';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionTargets } from '../positionGovernor/positionTargets';
import { findMatchUp } from '../../getters/getMatchUps/findMatchUp';
import { isCompletedStructure } from './structureActions';

import {
  ADD_PENALTY,
  ADD_PENALTY_METHOD,
} from '../../../constants/positionActionConstants';
import {
  MISSING_DRAW_DEFINITION,
  MISSING_MATCHUP_ID,
} from '../../../constants/errorConditionConstants';
import {
  BYE,
  DOUBLE_WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  END,
  REFEREE,
  SCHEDULE,
  SCORE,
  START,
  STATUS,
} from '../../../constants/matchUpActionConstants';

/**
 *
 * return an array of all validActions for a given matchUp
 *
 * @param {object} drawDefinition
 * @param {string} matchUpId
 *
 */
export function matchUpActions({
  drawDefinition,
  matchUpId,

  matchUpsMap,
  inContextDrawMatchUps,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!matchUpId) return { error: MISSING_MATCHUP_ID };

  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    matchUpId,
  });

  const { assignedPositions, allPositionsAssigned } =
    structureAssignedDrawPositions({ structure });
  const { drawPositions } = matchUp || {};
  const { structureId } = structure || {};

  const validActions = [];
  if (!structureId) return { validActions };

  const structureIsComplete = isCompletedStructure({
    drawDefinition,
    structure,
  });

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

  if (isByeMatchUp) return { validActions, isByeMatchUp };

  const matchUpDrawPositionsAreAssigned = drawPositions?.reduce(
    (assignedBoolean, drawPosition) =>
      participantAssignedDrawPositions.includes(drawPosition) &&
      assignedBoolean,
    drawPositions?.length === 2
  );

  validActions.push({ type: REFEREE });
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

  let activeDownstream;
  const isDoubleWalkover = matchUp.matchUpStatus === DOUBLE_WALKOVER;
  if (isDoubleWalkover) {
    matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });

    if (!inContextDrawMatchUps) {
      ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
        drawDefinition,
        inContext: true,
        includeByeMatchUps: true,

        matchUpsMap,
      }));
    }

    const targetData = positionTargets({
      matchUpId,
      drawDefinition,
      inContextDrawMatchUps,
    });
    activeDownstream = isActiveDownstream({
      inContextDrawMatchUps,
      targetData,
      drawDefinition,
    });
  }

  const readyToScore =
    (matchUpDrawPositionsAreAssigned || hasParticipants) &&
    !(isDoubleWalkover && activeDownstream);

  const { drawId } = drawDefinition;
  const addPenaltyAction = {
    type: ADD_PENALTY,
    method: ADD_PENALTY_METHOD,
    payload: {
      drawId,
      matchUpId,
      penaltyCode: undefined,
      penaltyType: undefined,
      participantIds: [],
      notes: undefined,
    },
  };
  if (isInComplete) validActions.push({ type: SCHEDULE });
  if (readyToScore) validActions.push(addPenaltyAction);
  if (isInComplete && readyToScore) validActions.push({ type: STATUS });
  if (scoringActive && readyToScore) {
    const { matchUpId, matchUpFormat } = matchUp;
    const payload = {
      drawId,
      matchUpId,
      matchUpFormat,
      outcome: {
        scoreStringSide1: undefined,
        scoreStringSide2: undefined,
        sets: [],
      },
      winningSide: undefined,
    };
    validActions.push({
      type: SCORE,
      method: 'setMatchUpStatus',
      message: 'set outcome and winningSide',
      payload,
    });
    validActions.push({ type: START });
    validActions.push({ type: END });
  }

  return {
    validActions,
    isDoubleWalkover,
    structureIsComplete,
  };
}
