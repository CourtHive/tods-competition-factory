import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { assignDrawPositionBye } from '../positionGovernor/byePositioning/assignDrawPositionBye';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { findStructure } from '../../getters/findStructure';
import { pushGlobalLog } from '../../../global/globalLog';
import { numericSort } from '../../../utilities';

import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { DEFAULTED, WALKOVER } from '../../../constants/matchUpStatusConstants';
import { INVALID_DRAW_POSITION } from '../../../constants/errorConditionConstants';

/*
  FIRST_MATCH_LOSER_CONSOLATION linkCondition... check whether it is a participant's first 
*/
export function directLoser(params) {
  const {
    loserMatchUp,
    drawDefinition,
    loserTargetLink,
    loserDrawPosition,
    loserMatchUpDrawPositionIndex,
  } = params;

  pushGlobalLog({
    color: 'brightblue',
    method: 'directLoser',
    loserDrawPosition,
  });

  const loserLinkCondition = loserTargetLink.linkCondition;
  const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];

  const fedDrawPositionFMLC =
    loserLinkCondition === FIRST_MATCHUP &&
    loserMatchUp.roundNumber === 2 &&
    Math.min(...targetMatchUpDrawPositions.filter(Boolean));

  const targetMatchUpDrawPosition =
    fedDrawPositionFMLC ||
    targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];
  const winnerBackdrawPosition =
    fedDrawPositionFMLC ||
    targetMatchUpDrawPositions[1 - loserMatchUpDrawPositionIndex];

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

  const validForConsolation =
    loserLinkCondition === FIRST_MATCHUP && loserDrawPositionWins.length === 0;

  const { positionAssignments: sourcePositionAssignments } =
    structureAssignedDrawPositions({
      drawDefinition,
      structureId: sourceStructureId,
    });

  const relevantAssignment = sourcePositionAssignments.find(
    (assignment) => assignment.drawPosition === loserDrawPosition
  );
  const loserParticipantId = relevantAssignment?.participantId;

  const targetStructureId = loserTargetLink.target.structureId;
  const { positionAssignments: targetPositionAssignments } =
    structureAssignedDrawPositions({
      drawDefinition,
      structureId: targetStructureId,
    });

  const targetMatchUpPositionAssignments = targetPositionAssignments.filter(
    ({ drawPosition }) => targetMatchUpDrawPositions.includes(drawPosition)
  );

  const loserAlreadyDirected = targetMatchUpPositionAssignments.some(
    (assignment) => assignment.participantId === loserParticipantId
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

  const targetDrawPositionIsUnfilled =
    unfilledTargetMatchUpDrawPositions.includes(targetMatchUpDrawPosition);

  const isFeedRound =
    loserTargetLink.target.roundNumber > 1 &&
    unfilledTargetMatchUpDrawPositions.length;

  const isFirstRoundValidDrawPosition =
    loserTargetLink.target.roundNumber === 1 && targetDrawPositionIsUnfilled;

  if (fedDrawPositionFMLC) {
    return loserLinkFedFMLC();
  } else if (isFirstRoundValidDrawPosition) {
    return asssignLoserDrawPosition();
  } else if (isFeedRound) {
    // if target.roundNumber > 1 then it is a feed round and should always take the lower drawPosition
    const fedDrawPosition =
      unfilledTargetMatchUpDrawPositions.sort(numericSort)[0];
    return assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition: fedDrawPosition,
      automaticPlacement: true,
    });
  } else {
    return { error: INVALID_DRAW_POSITION };
  }

  function loserLinkFedFMLC() {
    if (validForConsolation) {
      return asssignLoserDrawPosition();
    } else {
      return assignWinnerPositionBye();
    }
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
      automaticPlacement: true,
    });
  }
}
