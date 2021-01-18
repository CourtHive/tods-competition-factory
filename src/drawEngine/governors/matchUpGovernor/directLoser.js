import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { assignDrawPositionBye } from '../positionGovernor/assignDrawPositionBye';
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

  let error;
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
  if (loserAlreadyDirected) {
    return SUCCESS;
  }

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
  const isDefaultOrWalkover = [WALKOVER, DEFAULTED].includes(matchUpStatus);

  const { winnerHadMatchUpStatus: winnerByeDefWO } = includesMatchUpStatuses({
    sourceMatchUps,
    loserDrawPosition,
    drawPositionMatchUps,
    matchUpStatuses: [BYE, WALKOVER, DEFAULTED],
  });
  const { loserHadMatchUpStatus: defaultOrWalkover } = includesMatchUpStatuses({
    sourceMatchUps,
    loserDrawPosition,
    drawPositionMatchUps,
    matchUpStatuses: [WALKOVER, DEFAULTED],
  });
  const { loserHadMatchUpStatus: loserHadBye } = includesMatchUpStatuses({
    sourceMatchUps,
    loserDrawPosition,
    drawPositionMatchUps,
    matchUpStatuses: [BYE],
  });
  const firstMatchUpLossNotDefWO =
    loserLinkCondition === FIRST_MATCHUP &&
    loserDrawPositionWins.length === 0 &&
    !defaultOrWalkover;

  if (loserLinkCondition) {
    const drawPosition =
      targetMatchUpDrawPositions[1 - loserMatchUpDrawPositionIndex];
    if (firstMatchUpLossNotDefWO) {
      const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
        drawPosition
      );

      const result =
        targetPositionIsBye &&
        clearDrawPosition({
          drawDefinition,
          structureId: targetStructureId,
          drawPosition,
        });

      // drawPosition would not clear if player advanced by BYE had progressed
      if (result.success || targetDrawPositionIsUnfilled) {
        const result = assignDrawPosition({
          drawPosition,
          drawDefinition,
          structureId: targetStructureId,
          participantId: loserParticipantId,
        });
        if (result.error) {
          error = result.error;
        }

        if (winnerByeDefWO) {
          const result = assignDrawPositionBye({
            devContext,
            drawDefinition,
            structureId: targetStructureId,
            drawPosition: targetMatchUpDrawPosition,
          });
          if (result.error) {
            error = result.error;
          }
        }
      } else {
        error = result.error;
      }
    } else {
      if (winnerByeDefWO && !isDefaultOrWalkover) {
        // if participant won't be placed in targetStructure, place a BYE
        // if winner had [BYE, WALKOVER, or DEFAULT] and current matchUp is not [WALKOVER or DEFAULT]
        // this is the tricky bit of logic in FMLC... and perhaps why it should be refactored with 2nd round FEED
        const result = assignDrawPositionBye({
          devContext,
          drawDefinition,
          structureId: targetStructureId,
          drawPosition: targetMatchUpDrawPosition,
        });
        if (result.error) {
          error = result.error;
        }
      }

      if (loserHadBye) {
        const result = assignDrawPositionBye({
          devContext,
          drawDefinition,
          structureId: targetStructureId,
          drawPosition,
        });
        if (result.error) {
          error = result.error;
        }
      }
      if (isDefaultOrWalkover && !loserHadBye) {
        const result = assignDrawPositionBye({
          devContext,
          drawDefinition,
          structureId: targetStructureId,
          drawPosition: targetMatchUpDrawPosition,
        });
        if (result.error) {
          error = result.error;
        }
      }
    }

    // get participant's drawPosition in source structure
    // insure that participant has not participated in any other matchUps other than:
    // [WALKOVER, DEFAULT, BYE].includes(matchUp.matchUpStatus) && !matchUp.score?.sets?.length // SCORE: new object
  } else if (
    loserTargetLink.target.roundNumber === 1 &&
    targetDrawPositionIsUnfilled
  ) {
    if (defaultOrWalkover) {
      // if participant won't be placed in targetStructure, place a BYE
      const result = assignDrawPositionBye({
        devContext,
        drawDefinition,
        structureId: targetStructureId,
        drawPosition: targetMatchUpDrawPosition,
      });
      if (result.error) {
        error = result.error;
      }
    } else {
      assignDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        participantId: loserParticipantId,
        drawPosition: targetMatchUpDrawPosition,
      });
    }
  } else if (unfilledTargetMatchUpDrawPositions.length) {
    // if target.roundNumber > 1 then it is a feed round and should always take the lower drawPosition
    const drawPosition = unfilledTargetMatchUpDrawPositions.sort(
      numericSort
    )[0];
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition,
    });
  } else {
    error = 'loser target position unavaiallble';
  }

  return { error };
}
