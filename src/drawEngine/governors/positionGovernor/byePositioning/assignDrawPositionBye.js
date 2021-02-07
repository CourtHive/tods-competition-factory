import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { getRoundMatchUps } from '../../../accessors/matchUpAccessor/getRoundMatchUps';
import { getInitialRoundNumber } from '../../../getters/getInitialRoundNumber';
import { getAllDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../../getters/getMatchUps/getMatchUpsMap';
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
import { CONTAINER } from '../../../../constants/drawDefinitionConstants';

export function assignDrawPositionBye({
  drawDefinition,
  mappedMatchUps,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });

  const { positionAssignments } = getPositionAssignments({ structure });
  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });

  // ################### Check error conditions ######################
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

  // ########## gather reusable data for performance optimization ###########
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    drawDefinition,
    mappedMatchUps,
    inContext: true,
    includeByeMatchUps: true,
  });

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
  });

  // modifies the structure's positionAssignments
  // applies to both ELIMINATION and ROUND_ROBIN structures
  positionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      assignment.bye = true;
    }
  });

  if (structure.structureType === CONTAINER) {
    assignRoundRobinBye({ matchUps, drawPosition });
    return SUCCESS;
  }

  // ############ Get furthest advancement of drawPosition ############
  const { roundProfile, roundMatchUps } = getRoundMatchUps({ matchUps });

  // search from final rounds towards first rounds to find furthest advancement
  const roundNumbers = Object.keys(roundProfile)
    .map((roundNumber) => parseInt(roundNumber))
    .reverse();
  const roundNumber = roundNumbers.find((roundNumber) => {
    return roundProfile[roundNumber].drawPositions.includes(drawPosition);
  });

  // matchUp where BYE-advancement needs to occur
  const matchUp = roundMatchUps[roundNumber].find(({ drawPositions }) =>
    drawPositions.includes(drawPosition)
  );

  setMatchUpStatusBYE({ matchUp });

  const drawPositionToAdvance = matchUp.drawPositions.find(
    (position) => position !== drawPosition
  );

  if (drawPositionToAdvance) {
    const result = advanceDrawPosition({
      sourceDrawPositions: matchUp.drawPositions,
      matchUpId: matchUp.matchUpId,
      inContextDrawMatchUps,
      drawPositionToAdvance,
      drawDefinition,
      mappedMatchUps,
    });
    if (result.error) return result;
  }

  return SUCCESS;
}

function drawPositionFilled(positionAssignment) {
  const containsBye = positionAssignment.bye;
  const containsQualifier = positionAssignment.qualifier;
  const containsParticipant = positionAssignment.participantId;
  const filled = containsBye || containsQualifier || containsParticipant;
  return { containsBye, containsQualifier, containsParticipant, filled };
}

function setMatchUpStatusBYE({ matchUp }) {
  Object.assign(matchUp, {
    matchUpStatus: BYE,
    score: undefined,
    winningSide: undefined,
  });

  addNotice({
    topic: 'modifyMatchUp',
    payload: { matchUp },
  });
}

function assignRoundRobinBye({ matchUps, drawPosition }) {
  matchUps.forEach((matchUp) => {
    if (matchUp.drawPositions.includes(drawPosition)) {
      setMatchUpStatusBYE({ matchUp });
    }
  });
}

// Looks to see whether a given matchUp has a winnerMatchup or a loserMatchUp
// and if so advances the appropriate drawPosition into the targetMatchUp
function advanceDrawPosition({
  sourceDrawPositions,
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
    const { matchUp: noContextWinnerMatchUp, structure } = findMatchUp({
      drawDefinition,
      mappedMatchUps,
      matchUpId: winnerMatchUp.matchUpId,
    });
    const { positionAssignments } = getPositionAssignments({ structure });
    const drawPositionToAdvanceAssigment = positionAssignments.find(
      ({ drawPosition }) => drawPosition === drawPositionToAdvance
    );
    const drawPositionToAdvanceIsBye = drawPositionToAdvanceAssigment.bye;
    const existingDrawPositions = noContextWinnerMatchUp.drawPositions.filter(
      (f) => f
    );
    const existingAssignments = positionAssignments.filter((assignment) =>
      existingDrawPositions.includes(assignment.drawPosition)
    );

    const advancingAssignmentIsBye = positionAssignments.find(
      ({ drawPosition }) => drawPosition === drawPositionToAdvance
    );

    /// ????????????????????????????????????????
    // This may be unnecessary....
    const priorPair = sourceDrawPositions?.find(
      (drawPosition) => drawPosition !== drawPositionToAdvance
    );
    const priorPairAssignment =
      priorPair &&
      existingAssignments.find(
        ({ drawPosition }) => drawPosition === priorPair
      );
    const priorPairIsBye = priorPairAssignment?.bye;
    const isByeAdvancedBye = drawPositionToAdvanceIsBye && priorPairIsBye;
    /// ????????????????????????????????????????

    if (
      existingDrawPositions.length > 1 &&
      drawPositionToAdvanceIsBye &&
      !priorPairIsBye
    ) {
      return { error: DRAW_POSITION_ASSIGNED };
    }
    const pairedDrawPosition = existingDrawPositions.find(
      (drawPosition) => drawPosition !== drawPositionToAdvance
    );

    let drawPositionAssigned = isByeAdvancedBye;
    const drawPositions = (noContextWinnerMatchUp.drawPositions || [])?.map(
      (position) => {
        if (!position && !drawPositionAssigned) {
          drawPositionAssigned = true;
          return drawPositionToAdvance;
        } else if (position === drawPositionToAdvance) {
          drawPositionAssigned = true;
          return drawPositionToAdvance;
        } else {
          return position;
        }
      }
    );
    if (!drawPositionAssigned) {
      console.log('@@@@@@@', {
        advancingAssignmentIsBye,
        drawPositionToAdvance,
        existingAssignments,
      });
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
    Object.assign(noContextWinnerMatchUp, {
      matchUpStatus,
      score: undefined,
      winningSide: undefined,
      drawPositions,
    });
    addNotice({
      topic: 'modifyMatchUp',
      payload: { matchUp: noContextWinnerMatchUp },
    });

    if (
      drawPositions.filter((f) => f).length === 2 &&
      (pairedDrawPositionIsBye || drawPositionIsBye)
    ) {
      const advancingDrawPosition = pairedDrawPositionIsBye
        ? drawPositionToAdvance
        : pairedDrawPosition;

      if (advancingDrawPosition) {
        advanceDrawPosition({
          drawPositionToAdvance: advancingDrawPosition,
          matchUpId: winnerMatchUp.matchUpId,
          inContextDrawMatchUps,
          drawDefinition,
          mappedMatchUps,
        });
      }
    }
  }

  // only handling situation where a BYE is being placed in linked structure
  // and linked structure is NOT the same structure
  if (
    loserMatchUp &&
    losingDrawPosiitonIsBye &&
    loserMatchUp.structureId !== structure.structureId
  ) {
    const { drawPositions, roundNumber } = loserMatchUp;

    if (roundNumber === 1) {
      const sourceStructureRoundPosition = matchUp.roundPosition;
      // loser drawPosition in target structure is determined bye even/odd
      const targetDrawPositionIndex = 1 - (sourceStructureRoundPosition % 2);
      const targetDrawPosition = drawPositions[targetDrawPositionIndex];
      const result = assignDrawPositionBye({
        drawDefinition,
        structureId: loserTargetLink.target.structureId,
        drawPosition: targetDrawPosition,
      });
      if (result.error) return result;
    } else {
      const targetDrawPosition = Math.min(...drawPositions.filter((f) => f));
      const loserStructureMatchUps =
        mappedMatchUps[loserMatchUp.structureId].matchUps;
      const { initialRoundNumber } = getInitialRoundNumber({
        drawPosition: targetDrawPosition,
        matchUps: loserStructureMatchUps,
      });
      if (initialRoundNumber === roundNumber) {
        const result = assignDrawPositionBye({
          drawDefinition,
          structureId: loserTargetLink.target.structureId,
          drawPosition: targetDrawPosition,
        });
        if (result.error) return result;
      }
    }
  }

  return SUCCESS;
}
