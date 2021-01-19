import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { clearDrawPosition } from '../positionGovernor/positionClear';
import { includesMatchUpStatuses } from './includesMatchUpStatuses';
import { findStructure } from '../../getters/findStructure';
import { numericSort } from '../../../utilities';

import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  BYE,
  DEFAULTED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import { INVALID_DRAW_POSITION } from '../../../constants/errorConditionConstants';

/*
  FMLC linkCondition... check whether it is a participant's first 
*/
export function directLoser(props) {
  const {
    devContext,
    loserMatchUp,
    drawDefinition,
    loserTargetLink,
    loserDrawPosition,
    loserMatchUpDrawPositionIndex,
    matchUpStatus,
  } = props;

  const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];
  const sourceStructureId = loserTargetLink.source.structureId;
  const { structure } = findStructure({
    drawDefinition,
    structureId: sourceStructureId,
  });
  const { matchUps: sourceMatchUps } = getAllStructureMatchUps({
    inContext: true,
    drawDefinition,
    structure,
  });

  const drawPositionMatchUps = sourceMatchUps.filter((matchUp) =>
    matchUp.drawPositions.includes(loserDrawPosition)
  );

  // in this calculation BYEs and WALKOVERs are not counted as wins
  // as well as DEFAULTED when there is no score component
  const loserDrawPositionWins = drawPositionMatchUps.filter((matchUp) => {
    const drawPositionSide = matchUp.sides.find(
      (side) => side.drawPosition === loserDrawPosition
    );
    const unscoredOutcome =
      matchUp.matchUpStatus === WALKOVER ||
      (matchUp.matchUpStatus === DEFAULTED &&
        !!matchUp.score?.scoreStringSide1);
    return (
      drawPositionSide?.sideNumber === matchUp.winningSide && !unscoredOutcome
    );
  });

  const targetMatchUpDrawPosition =
    targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];

  const {
    positionAssignments: sourcePositionAssignments,
  } = structureAssignedDrawPositions({
    drawDefinition,
    structureId: sourceStructureId,
  });
  const loserParticipantId = sourcePositionAssignments.reduce(
    (participantId, assignment) => {
      return assignment.drawPosition === loserDrawPosition
        ? assignment.participantId
        : participantId;
    },
    undefined
  );

  const targetStructureId = loserTargetLink.target.structureId;
  const {
    positionAssignments: targetPositionAssignments,
  } = structureAssignedDrawPositions({
    drawDefinition,
    structureId: targetStructureId,
  });

  const loserAlreadyDirected = targetPositionAssignments.find(
    ({ participantId }) => participantId === loserParticipantId
  );
  if (loserAlreadyDirected) return SUCCESS;

  const unfilledTargetMatchUpDrawPositions = targetPositionAssignments
    .filter((assignment) => {
      const inTarget = targetMatchUpDrawPositions.includes(
        assignment.drawPosition
      );
      const unfilled =
        !assignment.participantId && !assignment.bye && !assignment.qualifier;
      return inTarget && unfilled;
    })
    .map((assignment) => assignment.drawPosition);

  const targetPositionIsBye = !!targetPositionAssignments.find(
    (assignment) => assignment.bye === true
  );

  const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
    targetMatchUpDrawPosition
  );

  const loserLinkCondition = loserTargetLink.linkCondition;
  const includesDefaultOrWalkover = [WALKOVER, DEFAULTED].includes(
    matchUpStatus
  );

  const { loserHadMatchUpStatus: defaultOrWalkover } = includesMatchUpStatuses({
    sourceMatchUps,
    loserDrawPosition,
    drawPositionMatchUps,
    matchUpStatuses: [WALKOVER, DEFAULTED],
  });
  const isFeedRound =
    loserTargetLink.target.roundNumber > 1 &&
    unfilledTargetMatchUpDrawPositions.length;

  const isFirstRoundValidDrawPosition =
    loserTargetLink.target.roundNumber === 1 && targetDrawPositionIsUnfilled;

  if (loserLinkCondition) {
    return loserLinkConditionLogic();
  } else if (isFirstRoundValidDrawPosition) {
    return asssignLoserDrawPosition();
  } else if (isFeedRound) {
    // if target.roundNumber > 1 then it is a feed round and should always take the lower drawPosition
    const fedDrawPosition = unfilledTargetMatchUpDrawPositions.sort(
      numericSort
    )[0];
    return assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition: fedDrawPosition,
    });
  } else {
    return { error: INVALID_DRAW_POSITION };
  }

  function loserLinkConditionLogic() {
    const firstMatchUpLossNotDefWO =
      loserLinkCondition === FIRST_MATCHUP &&
      loserDrawPositionWins.length === 0 &&
      !defaultOrWalkover;

    const { winnerHadMatchUpStatus: winnerByeDefWO } = includesMatchUpStatuses({
      sourceMatchUps,
      loserDrawPosition,
      drawPositionMatchUps,
      matchUpStatuses: [BYE, WALKOVER, DEFAULTED],
    });
    const { loserHadMatchUpStatus: loserHadBye } = includesMatchUpStatuses({
      sourceMatchUps,
      loserDrawPosition,
      drawPositionMatchUps,
      matchUpStatuses: [BYE],
    });
    const winnerBackdrawPosition =
      targetMatchUpDrawPositions[1 - loserMatchUpDrawPositionIndex];
    if (firstMatchUpLossNotDefWO) {
      const winnerBackdrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
        winnerBackdrawPosition
      );

      const result =
        targetPositionIsBye &&
        clearDrawPosition({
          drawDefinition,
          structureId: targetStructureId,
          drawPosition: winnerBackdrawPosition,
        });
      if (result.error) return result;

      // drawPosition would not clear if player advanced by BYE had progressed
      if (result.success || winnerBackdrawPositionIsUnfilled) {
        const result = assignDrawPosition({
          drawDefinition,
          participantId: loserParticipantId,
          structureId: targetStructureId,
          drawPosition: winnerBackdrawPosition,
        });
        if (result.error) return result;

        if (winnerByeDefWO) {
          const result = assignLoserPositionBye();
          if (result.error) return result;
        }
      } else {
        return { error: INVALID_DRAW_POSITION };
      }
    } else {
      if (winnerByeDefWO && !includesDefaultOrWalkover) {
        // if participant won't be placed in targetStructure, place a BYE
        // if winner had [BYE, WALKOVER, or DEFAULT] and current matchUp is not [WALKOVER or DEFAULT]
        // this is the tricky bit of logic in FMLC... and perhaps why it should be refactored with 2nd round FEED
        return assignLoserPositionBye();
      }

      if (loserHadBye) {
        const result = assignDrawPositionBye({
          devContext,
          drawDefinition,
          structureId: targetStructureId,
          drawPosition: winnerBackdrawPosition,
        });
        if (result.error) return result;
      }
      if (includesDefaultOrWalkover && !loserHadBye) {
        const result = assignLoserPositionBye();
        if (result.error) return result;
      }
    }

    return SUCCESS;
  }

  function assignLoserPositionBye() {
    return assignDrawPositionBye({
      devContext,
      drawDefinition,
      structureId: targetStructureId,
      drawPosition: targetMatchUpDrawPosition,
    });
  }

  function asssignLoserDrawPosition() {
    return assignDrawPosition({
      drawDefinition,
      participantId: loserParticipantId,
      structureId: targetStructureId,
      drawPosition: targetMatchUpDrawPosition,
    });
  }
}
