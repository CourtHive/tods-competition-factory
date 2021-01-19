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
    loserMatchUp,
    drawDefinition,
    loserTargetLink,
    loserDrawPosition,
    loserMatchUpDrawPositionIndex,
    originMatchUpLosingIndex,
  } = props;

  const loserLinkCondition = loserTargetLink.linkCondition;
  const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];

  const drawPositionIndex = loserLinkCondition
    ? originMatchUpLosingIndex
    : loserMatchUpDrawPositionIndex;
  const targetMatchUpDrawPosition =
    targetMatchUpDrawPositions[drawPositionIndex];
  const winnerBackdrawPosition =
    targetMatchUpDrawPositions[1 - drawPositionIndex];

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

  const targetMatchUpPositionAssignments = targetPositionAssignments.filter(
    ({ drawPosition }) => targetMatchUpDrawPositions.includes(drawPosition)
  );

  const loserAlreadyDirected = targetMatchUpPositionAssignments.reduce(
    (alreadyDirected, assignment) => {
      return alreadyDirected || assignment.participantId === loserParticipantId;
    },
    false
  );
  if (loserAlreadyDirected) {
    return SUCCESS;
  }

  const unfilledTargetMatchUpDrawPositions = targetMatchUpPositionAssignments
    .filter((assignment) => {
      const inTarget = targetMatchUpDrawPositions.includes(
        assignment.drawPosition
      );
      const unfilled =
        !assignment.participantId && !assignment.bye && !assignment.qualifier;
      return inTarget && unfilled;
    })
    .map((assignment) => assignment.drawPosition);

  const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
    targetMatchUpDrawPosition
  );

  const {
    loserHadMatchUpStatus: includesDefaultOrWalkover,
  } = includesMatchUpStatuses({
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
    const validForConsolation =
      loserLinkCondition === FIRST_MATCHUP &&
      (includesDefaultOrWalkover || loserDrawPositionWins.length === 0);

    const { winnerHadMatchUpStatus: winnerByeDefWO } = includesMatchUpStatuses({
      sourceMatchUps,
      loserDrawPosition,
      drawPositionMatchUps,
      matchUpStatuses: [BYE, WALKOVER, DEFAULTED],
    });
    const winnerBackdrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
      winnerBackdrawPosition
    );

    if (validForConsolation && targetDrawPositionIsUnfilled) {
      const result = asssignLoserDrawPosition();
      if (result.error) return result;
    }

    if (winnerByeDefWO && winnerBackdrawPositionIsUnfilled) {
      let result = clearDrawPosition({
        drawDefinition,
        structureId: targetStructureId,
        drawPosition: winnerBackdrawPosition,
      });
      if (result.error) return result;

      return assignWinnerPositionBye();
    }

    return SUCCESS;
  }

  function assignWinnerPositionBye() {
    return assignDrawPositionBye({
      drawDefinition,
      structureId: targetStructureId,
      drawPosition: winnerBackdrawPosition,
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
