import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { structureActiveDrawPositions } from '../../../getters/structureActiveDrawPositions';
import { getRoundMatchUps } from '../../../accessors/matchUpAccessor/getRoundMatchUps';
import { getInitialRoundNumber } from '../../../getters/getInitialRoundNumber';
import { getAllDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../../getters/getMatchUps/getMatchUpsMap';
import { getPositionAssignments } from '../../../getters/positionsGetter';
import { findMatchUp } from '../../../getters/getMatchUps/findMatchUp';
import { findStructure } from '../../../getters/findStructure';
import { addNotice, getDevContext } from '../../../../global/globalState';
import { positionTargets } from '../positionTargets';

import { pushGlobalLog } from '../../../../global/globalLog';

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
import {
  CONSOLATION,
  CONTAINER,
} from '../../../../constants/drawDefinitionConstants';

/*
  assignDrawPositionBye

  supporting functions:
  - drawPositionFilled
  - setMatchUpStatusBYE
  - assignRoundRobinBYE
  - advanceDrawPosition

  PSEUDOCODE:
  *. Requires allDrawMatchUps inContext
  *. Requires structureMatchUps
 
  => assignDrawPositionBye
  1. Modifies structure positionAssignments to assign BYE to position
     - if structure is part of ROUND ROBIN then return SUCCESS
  2. Finds the furthest advancement of the drawPosition to determine the matchUp where BYE-advancement needs to occur
  3. Set the matchUpStatus to BYE
  4. Check whether there is a position to Advance

  If so...
  => advancePosition
  5a. Use links to find winnerMatchUp and loserMatchUp

  6. If winnerMatchUp is part of same structure...
  6a. Add drawPosition to target matchUp 
  6b. Check for further advancement and if so, go back to step #5
  6b. If no further positions to advance check for FMLC Consolation BYE assignment

  7. If loserMatchUp is part of different structure... return to step #1
 */

export function assignDrawPositionBye({
  drawDefinition,
  mappedMatchUps,
  structureId,
  drawPosition,
  iterative,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });

  pushGlobalLog({
    color: iterative || 'yellow',
    keyColors: { stage: structure.stage === CONSOLATION && 'brightcyan' },
    method: 'assignDrawPositionBye',
    structureName: structure.structureName,
    drawPosition,
  });

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
    assignRoundRobinBYE({ matchUps, drawPosition });
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

  pushGlobalLog({
    method: `furthest advancement`,
    keyColors: { drawPositionToAdvance: 'brightyellow' },
    drawPosition,
    roundNumber,
    drawPositionToAdvance,
  });

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

function assignRoundRobinBYE({ matchUps, drawPosition }) {
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
  iterative,
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

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = positionTargets({
    matchUpId,
    structure,
    mappedMatchUps,
    drawDefinition,
    inContextDrawMatchUps,
  });

  pushGlobalLog({
    method: `advanceDrawPosition`,
    color: iterative,
    keyColors: { drawPositionToAdvance: 'brightyellow' },
    structureName: structure.structureName,
    drawPositionToAdvance,
    losingDrawPosition,
    losingDrawPosiitonIsBye,
  });

  // only handling situation where winningMatchUp is in same structure
  if (winnerMatchUp && winnerMatchUp.structureId === structure.structureId) {
    advanceWinner({
      drawDefinition,
      mappedMatchUps,
      winnerMatchUp,
      drawPositionToAdvance,
      sourceDrawPositions,
      inContextDrawMatchUps,
    });
  }

  // only handling situation where a BYE is being placed in linked structure
  // and linked structure is NOT the same structure
  if (
    loserMatchUp &&
    losingDrawPosiitonIsBye &&
    loserMatchUp.structureId !== structure.structureId
  ) {
    const { roundNumber } = loserMatchUp;
    if (roundNumber === 1) {
      const result = assignDrawPositionBye({
        drawDefinition,
        structureId: loserTargetLink.target.structureId,
        drawPosition: loserTargetDrawPosition,
        iterative: 'brightyellow',
      });
      if (result.error) return result;
    } else {
      assignFedDrawPositionBye({
        drawDefinition,
        loserMatchUp,
        loserTargetLink,
        mappedMatchUps,
        loserTargetDrawPosition,
      });
    }
  }

  return SUCCESS;
}

function advanceWinner({
  drawDefinition,
  mappedMatchUps,
  winnerMatchUp,
  drawPositionToAdvance,
  sourceDrawPositions,
  inContextDrawMatchUps,
}) {
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
    existingAssignments.find(({ drawPosition }) => drawPosition === priorPair);
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

  if (pairedDrawPositionIsBye || drawPositionIsBye) {
    const advancingDrawPosition = pairedDrawPositionIsBye
      ? drawPositionToAdvance
      : pairedDrawPosition;

    pushGlobalLog({
      method: `advancingDrawPosition`,
      color: 'brightcyan',
      keyColors: { advancingDrawPosition: 'brightyellow' },
      drawPositionIsBye,
      advancingDrawPosition,
      drawPositionToAdvance,
      pairedDrawPositionIsBye,
    });

    if (advancingDrawPosition) {
      advanceDrawPosition({
        drawPositionToAdvance: advancingDrawPosition,
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        drawDefinition,
        mappedMatchUps,
        iterative: 'brightmagenta',
      });
    } else if (drawPositionIsBye) {
      const {
        targetLinks: { loserTargetLink },
        targetMatchUps: { loserMatchUp, loserTargetDrawPosition },
      } = positionTargets({
        matchUpId: winnerMatchUp.matchUpId,
        structure,
        mappedMatchUps,
        drawDefinition,
        inContextDrawMatchUps,
      });
      if (loserTargetLink && loserMatchUp) {
        if (loserMatchUp.feedRound) {
          assignFedDrawPositionBye({
            drawDefinition,
            loserMatchUp,
            loserTargetLink,
            mappedMatchUps,
            loserTargetDrawPosition,
          });
        } else {
          const sourceStructureRoundPosition = winnerMatchUp.roundPosition;
          // loser drawPosition in target structure is determined bye even/odd
          const targetDrawPositionIndex =
            1 - (sourceStructureRoundPosition % 2);
          const targetDrawPosition =
            loserMatchUp.drawPositions[targetDrawPositionIndex];

          pushGlobalLog({
            method: `assignLoserTargetDrawPositionBye`,
            color: 'brightred',
            targetDrawPositionIndex,
            targetDrawPosition,
            sourceStructureRoundPosition,
          });
          const result = assignDrawPositionBye({
            drawDefinition,
            structureId: loserTargetLink.target.structureId,
            drawPosition: targetDrawPosition,
            loserTargetDrawPosition,
            iterative: 'brightgreen',
          });
          if (result.error) return result;
        }
      }
    }
  }
}

function assignFedDrawPositionBye({
  drawDefinition,
  loserMatchUp,
  loserTargetLink,
  mappedMatchUps,
  loserTargetDrawPosition,
}) {
  const { roundNumber } = loserMatchUp;

  pushGlobalLog({
    method: `assignFedDrawPositionBye`,
    color: 'brightcyan',
    loserTargetDrawPosition,
  });
  const loserStructureMatchUps =
    mappedMatchUps[loserMatchUp.structureId].matchUps;
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition: loserTargetDrawPosition,
    matchUps: loserStructureMatchUps,
  });
  if (initialRoundNumber === roundNumber) {
    const result = assignDrawPositionBye({
      drawDefinition,
      structureId: loserTargetLink.target.structureId,
      drawPosition: loserTargetDrawPosition,
      iterative: 'red',
    });
    if (result.error) return result;
  }
}
