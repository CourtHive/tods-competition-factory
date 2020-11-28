import { FIRST_MATCHUP } from '../../../constants/drawDefinitionConstants';
import { findStructure } from '../../getters/findStructure';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { assignDrawPosition } from '../positionGovernor/positionAssignment';
import { clearDrawPosition } from '../positionGovernor/positionClear';

/*
  FMLC linkCondition... check whether it is a participant's first 
*/
export function directLoser({
  loserMatchUp,
  drawDefinition,
  loserTargetLink,
  loserDrawPosition,
  loserMatchUpDrawPositionIndex,
}) {
  let error;
  const targetMatchUpDrawPositions = loserMatchUp.drawPositions || [];
  const targetMatchUpDrawPosition =
    targetMatchUpDrawPositions[loserMatchUpDrawPositionIndex];

  const sourceStructureId = loserTargetLink.source.structureId;
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

  const unfilledTargetMatchUpDrawPositions = targetPositionAssignments
    .filter(assignment => {
      const inTarget = targetMatchUpDrawPositions.includes(
        assignment.drawPosition
      );
      const unfilled =
        !assignment.participantId && !assignment.bye && !assignment.qualifier;
      return inTarget && unfilled;
    })
    .map(assignment => assignment.drawPosition);
  const targetDrawPositionIsUnfilled = unfilledTargetMatchUpDrawPositions.includes(
    targetMatchUpDrawPosition
  );

  const targetPositionIsBye = !!targetPositionAssignments.find(
    assignment => assignment.bye === true
  );

  const loserLinkCondition = loserTargetLink.linkCondition;
  if (loserLinkCondition) {
    const { structure } = findStructure({
      drawDefinition,
      structureId: sourceStructureId,
    });
    const { matchUps: sourceMatchUps } = getAllStructureMatchUps({
      inContext: true,
      drawDefinition,
      structure,
    });

    const drawPositionMatchUps = sourceMatchUps.filter(matchUp =>
      matchUp.drawPositions.includes(loserDrawPosition)
    );

    const loserDrawPositionWins = drawPositionMatchUps.filter(matchUp => {
      const drawPositionSide = matchUp.sides.find(
        side => side.drawPosition === loserDrawPosition
      );
      return drawPositionSide?.sideNumber === matchUp.winningSide;
    });

    const meetsCondition =
      loserLinkCondition === FIRST_MATCHUP &&
      loserDrawPositionWins.length === 0;

    if (meetsCondition) {
      const result =
        targetPositionIsBye &&
        clearDrawPosition({
          drawDefinition,
          structureId: targetStructureId,
          drawPosition: targetMatchUpDrawPosition,
        });

      // drawPosition would not clear if player advanced by BYE had progressed
      if (result.success || targetDrawPositionIsUnfilled) {
        assignDrawPosition({
          drawDefinition,
          structureId: targetStructureId,
          participantId: loserParticipantId,
          drawPosition: targetMatchUpDrawPosition,
        });
      }
    } else {
      console.log('TODO: insure position is filled with a BYE');
    }

    // get participant's drawPosition in source structure
    // insure that participant has not participated in any other matchUps other than:
    // [WALKOVER, DEFAULT, BYE].includes(matchUp.matchUpStatus) && !score
  } else if (
    loserTargetLink.target.roundNumber === 1 &&
    targetDrawPositionIsUnfilled
  ) {
    assignDrawPosition({
      drawDefinition,
      structureId: targetStructureId,
      participantId: loserParticipantId,
      drawPosition: targetMatchUpDrawPosition,
    });
  } else if (unfilledTargetMatchUpDrawPositions.length) {
    // if roundNumber !== 1 then it is a feed arm and any unfilled position in target matchUp will do
    const drawPosition = unfilledTargetMatchUpDrawPositions.pop();
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
