import { findStructure } from '../../../getters/findStructure';
import { getAllDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { positionTargets } from '../positionTargets';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { assignMatchUpDrawPosition } from '../../matchUpGovernor/matchUpDrawPosition';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';
import { setMatchUpStatus } from '../../matchUpGovernor/setMatchUpStatus';
import { getStructureLinks } from '../../../getters/linkGetter';

import { numericSort } from '../../../../utilities';

import { BYE } from '../../../../constants/matchUpStatusConstants';
import {
  DRAW_POSITION_ACTIVE,
  INVALID_DRAW_POSITION,
  DRAW_POSITION_ASSIGNED,
  MISSING_DRAW_POSITIONS,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function assignDrawPositionBye({
  drawDefinition,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });

  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);

  const positionState = positionAssignments.reduce(
    (p, c) => (c.drawPosition === drawPosition ? c : p),
    undefined
  );
  if (!positionState) return { error: INVALID_DRAW_POSITION };

  const { filled, containsBye } = drawPositionFilled(positionState);
  if (filled && !containsBye) {
    return { error: DRAW_POSITION_ASSIGNED };
  }
  if (drawPositionIsActive) return { error: DRAW_POSITION_ACTIVE };

  positionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      assignment.bye = true;
    }
  });

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    matchUpFilters,
    structure,
  });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    inContext: true,
    includeByeMatchUps: true,
  });

  matchUps.forEach((matchUp) => {
    if (matchUp.drawPositions?.includes(drawPosition)) {
      assignBye({
        matchUp,
        structure,
        drawPosition,
        drawDefinition,
        positionAssignments,
        inContextDrawMatchUps,
      });
    }
  });

  return SUCCESS;

  function drawPositionFilled(positionState) {
    const containsBye = positionState.bye;
    const containsQualifier = positionState.qualifier;
    const containsParticipant = positionState.participantId;
    const filled = containsBye || containsQualifier || containsParticipant;
    return { containsBye, containsQualifier, containsParticipant, filled };
  }
}

function assignBye({
  matchUp,
  structure,
  drawPosition,
  drawDefinition,
  positionAssignments,
  inContextDrawMatchUps,
}) {
  const { matchUpId } = matchUp;

  setMatchUpStatus({
    drawDefinition,
    matchUpId,
    matchUpStatus: BYE,
  });

  const pairedDrawPosition = matchUp.drawPositions?.reduce(
    (pairedDrawPosition, currentDrawPosition) => {
      return currentDrawPosition !== drawPosition
        ? currentDrawPosition
        : pairedDrawPosition;
    },
    undefined
  );

  const sourceMatchUpWinnerDrawPositionIndex = matchUp.drawPositions?.indexOf(
    drawPosition
  );

  // if there is a linked draw then BYE must also be placed there
  // This must be propagated through compass draw, for instance
  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = positionTargets({
    matchUpId,
    structure,
    drawDefinition,
    inContextDrawMatchUps,
    sourceMatchUpWinnerDrawPositionIndex,
  });

  if (loserMatchUp) {
    // find all links which target the same roundNumber of structure within which loserMatchUp occurs
    const {
      links: { target: linksTargetingStructure },
    } = getStructureLinks({
      drawDefinition,
      roundNumber: loserMatchUp.roundNumber,
      structureId: loserTargetLink.target.structureId,
    });

    const linkCondition = linksTargetingStructure.find(
      (link) => link.linkCondition
    );

    // loserMatchUp must have both drawPositions defined
    const loserMatchUpDrawPositionsCount = loserMatchUp.drawPositions?.filter(
      (f) => f
    ).length;
    if (loserMatchUpDrawPositionsCount !== 2)
      return { error: MISSING_DRAW_POSITIONS };
    // drawPositions must be in numerical order
    loserMatchUp.drawPositions = (loserMatchUp.drawPositions || []).sort(
      numericSort
    );
    // loser drawPosition in target structure is determined bye even/odd
    const targetDrawPositionIndex = 1 - (matchUp.roundPosition % 2);

    const targetDrawPosition =
      loserMatchUp.drawPositions[targetDrawPositionIndex];

    // don't assign BYE for FMLC
    // TODO: make this more explicit
    const targetBye = !linkCondition;

    if (targetBye) {
      const result = assignDrawPositionBye({
        drawDefinition,
        structureId: loserTargetLink.target.structureId,
        drawPosition: targetDrawPosition,
      });
      if (result.error) {
        console.log('targetBye', { result });
      }
    }
  }

  if (winnerMatchUp && pairedDrawPosition) {
    const drawPositionIsBye = positionAssignments.find(
      (assignment) => assignment.drawPosition === drawPosition
    )?.bye;
    const pairedDrawPositionIsBye = positionAssignments.find(
      (assignment) => assignment.drawPosition === pairedDrawPosition
    )?.bye;
    // TODO: is it possible that a WINNER could be directed to a different structure?
    // winner participantId would then need to be added to positionAssignments
    const isDoubleBye = drawPositionIsBye && pairedDrawPositionIsBye;
    if (!isDoubleBye) {
      assignMatchUpDrawPosition({
        drawDefinition,
        matchUpId: winnerMatchUp.matchUpId,
        drawPosition: pairedDrawPosition,
      });
    }
  }
}
