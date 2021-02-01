import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { getRoundMatchUps } from '../../../accessors/matchUpAccessor/getRoundMatchUps';
import { getAllDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { getPositionAssignments } from '../../../getters/positionsGetter';
import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../getters/findStructure';
import { addNotice } from '../../../../global/globalState';
import { positionTargets } from '../positionTargets';

import {
  DRAW_POSITION_ACTIVE,
  INVALID_DRAW_POSITION,
  DRAW_POSITION_ASSIGNED,
} from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';

export function assignDrawPositionBye({
  drawDefinition,
  mappedMatchUps,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  if (structure.stage === 'CONSOLATION')
    console.log('assignDrawPositionBye', { drawPosition });
  const { positionAssignments } = getPositionAssignments({ structure });
  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);
  if (drawPositionIsActive) return { error: DRAW_POSITION_ACTIVE };

  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment) return { error: INVALID_DRAW_POSITION };

  const { filled, containsBye } = drawPositionFilled(positionAssignment);
  if (containsBye) return SUCCESS; // nothing to be done

  if (filled && !containsBye) {
    console.log('assignDrawPositionBye ##');
    return { error: DRAW_POSITION_ASSIGNED };
  }

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
  });
  const { roundProfile, roundMatchUps } = getRoundMatchUps({ matchUps });
  const roundNumbers = Object.keys(roundProfile).map((roundNumber) =>
    parseInt(roundNumber)
  );

  const roundNumber = roundNumbers.find((roundNumber) => {
    return roundProfile[roundNumber].drawPositions.includes(drawPosition);
  });
  const matchUp = roundMatchUps[roundNumber].find(({ drawPositions }) =>
    drawPositions.includes(drawPosition)
  );
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    mappedMatchUps,
    inContext: true,
    includeByeMatchUps: true,
  });

  const positionPair = roundProfile[
    roundNumber
  ].pairedDrawPositions.find((pair) => pair.includes(drawPosition));

  const drawPositionToAdvance = positionPair?.find(
    (position) => position !== drawPosition
  );

  if (!drawPositionToAdvance) {
    console.log('TODO:', { drawPosition, positionPair });
    return { message: 'drawPosition: 3 should be a BYE' };
  }

  // modifies the structure's positionAssignments
  positionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      assignment.bye = true;
    }
  });

  Object.assign(matchUp, {
    matchUpStatus: BYE,
    score: undefined,
    winningSide: undefined,
  });

  addNotice({
    topic: 'modifyMatchUp',
    payload: { matchUp },
  });

  const result = advanceDrawPosition({
    matchUpId: matchUp.matchUpId,
    inContextDrawMatchUps,
    drawPositionToAdvance,
    drawDefinition,
    mappedMatchUps,
  });
  if (result.error) return result;

  return SUCCESS;
}

function drawPositionFilled(positionAssignment) {
  const containsBye = positionAssignment.bye;
  const containsQualifier = positionAssignment.qualifier;
  const containsParticipant = positionAssignment.participantId;
  const filled = containsBye || containsQualifier || containsParticipant;
  return { containsBye, containsQualifier, containsParticipant, filled };
}

function advanceDrawPosition({
  drawPositionToAdvance,
  inContextDrawMatchUps,
  drawDefinition,
  mappedMatchUps,
  matchUpId,
}) {
  const { matchUp, structure } = findMatchUp({
    drawDefinition,
    mappedMatchUps,
    matchUpId,
  });

  const { positionAssignments } = getPositionAssignments({
    structure,
  });

  const byeAssignedDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const losingDrawPosition = matchUp.drawPositions.find(
    (drawPosition) => drawPosition !== drawPositionToAdvance
  );
  const losingDrawPosiitonIsBye = byeAssignedDrawPositions.includes(
    losingDrawPosition
  );

  const sourceMatchUpWinnerDrawPositionIndex = matchUp.drawPositions?.indexOf(
    drawPositionToAdvance
  );

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp },
  } = positionTargets({
    matchUpId,
    structure,
    mappedMatchUps,
    drawDefinition,
    inContextDrawMatchUps,
    sourceMatchUpWinnerDrawPositionIndex,
  });

  // only handling situation where winningMatchUp is in same structure
  if (winnerMatchUp && winnerMatchUp.structureId === structure.structureId) {
    const { matchUp, structure } = findMatchUp({
      drawDefinition,
      mappedMatchUps,
      matchUpId: winnerMatchUp.matchUpId,
    });
    const { positionAssignments } = getPositionAssignments({ structure });
    const existingDrawPositions = winnerMatchUp.drawPositions.filter((f) => f);
    const unfilledAssignment = positionAssignments.find(
      (assignment) => !drawPositionFilled(assignment).filled
    );
    const existingByeAssignments = positionAssignments
      .filter(({ drawPosition }) =>
        existingDrawPositions.includes(drawPosition)
      )
      .filter(({ bye }) => bye);
    const advancingAssignmentIsBye = positionAssignments.find(
      ({ drawPosition }) => drawPosition === drawPositionToAdvance
    );
    const isByeAdvancedBye =
      existingByeAssignments.length === 2 && advancingAssignmentIsBye;
    if (!isByeAdvancedBye && existingDrawPositions.length > 1) {
      if (!unfilledAssignment) {
        console.log('####');
        return { error: DRAW_POSITION_ASSIGNED };
      }
    }
    const pairedDrawPosition = existingDrawPositions.find(
      (drawPosition) => drawPosition !== drawPositionToAdvance
    );

    // This should work but does NOT because apparently order is still important... why?
    // const drawPositions = [pairedDrawPosition, drawPositionToAdvance];

    const unfilledDrawPosition = unfilledAssignment?.drawPosition;

    let drawPositionAssigned = isByeAdvancedBye;
    const drawPositions = (matchUp.drawPositions || [])?.map((position) => {
      if (!position && !drawPositionAssigned) {
        drawPositionAssigned = true;
        return drawPositionToAdvance;
      } else if (position === drawPositionToAdvance) {
        drawPositionAssigned = true;
        return drawPositionToAdvance;
      } else if (unfilledDrawPosition && position === unfilledDrawPosition) {
        drawPositionAssigned = true;
        return drawPositionToAdvance;
      } else {
        return position;
      }
    });
    if (!drawPositionAssigned) {
      console.log('@@@@@@@');
      return { error: DRAW_POSITION_ASSIGNED };
    }
    const pairedDrawPositionIsBye = positionAssignments.find(
      ({ drawPosition }) => drawPosition === pairedDrawPosition
    )?.bye;
    const drawPositionIsBye = positionAssignments.find(
      ({ drawPosition }) => drawPosition === drawPositionToAdvance
    )?.bye;

    const matchUpStatus =
      drawPositionIsBye || pairedDrawPositionIsBye ? BYE : TO_BE_PLAYED;
    Object.assign(matchUp, {
      matchUpStatus,
      score: undefined,
      winningSide: undefined,
      drawPositions,
    });
    addNotice({
      topic: 'modifyMatchUp',
      payload: { matchUp },
    });

    if (pairedDrawPositionIsBye || drawPositionIsBye) {
      const advancingDrawPosition = pairedDrawPositionIsBye
        ? drawPositionToAdvance
        : pairedDrawPosition;
      advanceDrawPosition({
        drawPositionToAdvance: advancingDrawPosition,
        matchUpId: matchUp.matchUpId,
        inContextDrawMatchUps,
        drawDefinition,
        mappedMatchUps,
      });
    }
  }

  // only handling situation where a BYE is being placed in linked structure
  // and linked structure is NOT the same structure
  if (
    loserMatchUp &&
    losingDrawPosiitonIsBye &&
    loserMatchUp.structureId !== structure.structureId
  ) {
    // loser drawPosition in target structure is determined bye even/odd
    const targetDrawPositionIndex = 1 - (matchUp.roundPosition % 2);

    const targetDrawPosition =
      loserMatchUp.drawPositions[targetDrawPositionIndex];

    const result = assignDrawPositionBye({
      drawDefinition,
      structureId: loserTargetLink.target.structureId,
      drawPosition: targetDrawPosition,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}
