import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { getStructureDrawPositionProfiles } from '../../../getters/getStructureDrawPositionProfiles';
import { getRoundMatchUps } from '../../../accessors/matchUpAccessor/getRoundMatchUps';
import { getInitialRoundNumber } from '../../../getters/getInitialRoundNumber';
import { getAllDrawMatchUps } from '../../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../../getters/getMatchUps/getMatchUpsMap';
import { decorateResult } from '../../../../global/functions/decorateResult';
import { addPositionActionTelemetry } from '../addPositionActionTelemetry';
import { getPositionAssignments } from '../../../getters/positionsGetter';
import { findStructure } from '../../../getters/findStructure';
import { positionTargets } from '../positionTargets';
import {
  modifyMatchUpNotice,
  modifyPositionAssignmentsNotice,
} from '../../../notifications/drawNotifications';

import { CONTAINER } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import {
  DRAW_POSITION_ACTIVE,
  INVALID_DRAW_POSITION,
  DRAW_POSITION_ASSIGNED,
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  BYE,
  TO_BE_PLAYED,
} from '../../../../constants/matchUpStatusConstants';

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
     - if structure is part of ROUND ROBIN then return { ...SUCCESS }
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
  // drawPositionIndex,
  isPositionAction,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  matchUpsMap,
  structureId,
  structure,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));

  if (!structure) return { error: STRUCTURE_NOT_FOUND };
  if (!structureId) ({ structureId } = structure);
  const stack = 'assignDrawPositionBye';

  if (!matchUpsMap) {
    matchUpsMap = getMatchUpsMap({ drawDefinition });
  }

  const { positionAssignments } = getPositionAssignments({ structure });
  const { activeDrawPositions } = getStructureDrawPositionProfiles({
    drawDefinition,
    structureId,
  });

  const currentAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );

  if (currentAssignment?.bye) return { ...SUCCESS };

  // ################### Check error conditions ######################
  const drawPositionIsActive = activeDrawPositions?.includes(drawPosition);
  if (drawPositionIsActive) {
    return { error: DRAW_POSITION_ACTIVE };
  }

  const positionAssignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === drawPosition
  );
  if (!positionAssignment) return { error: INVALID_DRAW_POSITION };

  const { filled, containsBye, assignedParticipantId } =
    drawPositionFilled(positionAssignment);
  if (containsBye) return { ...SUCCESS }; // nothing to be done

  if (filled && !containsBye) {
    return decorateResult({ result: { error: DRAW_POSITION_ASSIGNED }, stack });
  }

  // ########## gather reusable data for performance optimization ###########
  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    includeByeMatchUps: true,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    matchUpFilters,
    matchUpsMap,
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
    assignRoundRobinBYE({
      tournamentRecord,
      drawDefinition,
      drawPosition,
      matchUps,
    });

    modifyPositionAssignmentsNotice({
      tournamentId: tournamentRecord?.tournamentId,
      structureIds: [structureId],
      eventId: event?.eventId,
      positionAssignments,
      drawDefinition,
      structure,
    });

    return successNotice({
      assignedParticipantId,
      isPositionAction,
      drawDefinition,
      drawPosition,
      structureId,
      stack,
    });
  }

  // ############ Get furthest advancement of drawPosition ############
  const { roundProfile, roundMatchUps } = getRoundMatchUps({ matchUps });

  // search from final rounds towards first rounds to find furthest advancement
  const roundNumbers = Object.keys(roundProfile)
    .map((roundNumber) => parseInt(roundNumber))
    .reverse();
  const roundNumber = roundNumbers.find((roundNumber) => {
    return roundProfile[roundNumber].drawPositions?.includes(drawPosition);
  });

  // matchUp where BYE-advancement needs to occur
  const matchUp = roundMatchUps[roundNumber].find(({ drawPositions }) =>
    drawPositions?.includes(drawPosition)
  );

  setMatchUpStatusBYE({ drawDefinition, matchUp, event });

  const drawPositionToAdvance = matchUp.drawPositions?.find(
    (position) => position !== drawPosition
  );

  if (drawPositionToAdvance) {
    const result = advanceDrawPosition({
      sourceDrawPositions: matchUp.drawPositions,
      matchUpId: matchUp.matchUpId,
      inContextDrawMatchUps,
      drawPositionToAdvance,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
    });
    if (result.error) return result;
  }

  modifyPositionAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    structureIds: [structureId],
    eventId: event?.eventId,
    positionAssignments,
    drawDefinition,
    structure,
  });

  return successNotice({
    assignedParticipantId,
    isPositionAction,
    drawDefinition,
    drawPosition,
    structureId,
    stack,
  });
}

function successNotice({
  assignedParticipantId,
  isPositionAction,
  drawDefinition,
  drawPosition,
  structureId,
  stack,
}) {
  if (isPositionAction) {
    const positionAction = {
      removedParticipantId: assignedParticipantId,
      drawPosition,
      structureId,
      name: stack,
    };
    addPositionActionTelemetry({ drawDefinition, positionAction });
  }

  return decorateResult({ result: { ...SUCCESS }, stack });
}

function drawPositionFilled(positionAssignment) {
  const containsBye = positionAssignment.bye;
  const containsQualifier = positionAssignment.qualifier;
  const assignedParticipantId = positionAssignment.participantId;
  const filled = containsBye || containsQualifier || assignedParticipantId;
  return { containsBye, containsQualifier, assignedParticipantId, filled };
}

function setMatchUpStatusBYE({
  tournamentRecord,
  drawDefinition,
  matchUp,
  event,
}) {
  Object.assign(matchUp, {
    matchUpStatus: BYE,
    score: undefined,
    winningSide: undefined,
  });

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    context: 'setMatchUpStatusBye',
    eventId: event?.eventId,
    drawDefinition,
    matchUp,
  });
}

function assignRoundRobinBYE({
  tournamentRecord,
  drawDefinition,
  drawPosition,
  matchUps,
  event,
}) {
  matchUps.forEach((matchUp) => {
    if (matchUp.drawPositions?.includes(drawPosition)) {
      setMatchUpStatusBYE({
        tournamentId: tournamentRecord?.tournamentId,
        eventId: event?.eventId,
        drawDefinition,
        matchUp,
      });
    }
  });
}

// Looks to see whether a given matchUp has a winnerMatchup or a loserMatchUp
// and if so advances the appropriate drawPosition into the targetMatchUp
export function advanceDrawPosition({
  drawPositionToAdvance,
  inContextDrawMatchUps,
  sourceDrawPositions,
  tournamentRecord,
  drawDefinition,
  matchUpsMap,
  matchUpId,
  event,
}) {
  const matchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  const inContextMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  const structureId = inContextMatchUp?.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = getPositionAssignments({
    structure,
  });

  const byeAssignedDrawPositions = positionAssignments
    .filter((assignment) => assignment.bye)
    .map((assignment) => assignment.drawPosition);

  const losingDrawPosition = matchUp.drawPositions.find(
    (drawPosition) => drawPosition !== drawPositionToAdvance
  );
  const losingDrawPosiitonIsBye =
    byeAssignedDrawPositions?.includes(losingDrawPosition);

  const {
    targetLinks: { loserTargetLink },
    targetMatchUps: { loserMatchUp, winnerMatchUp, loserTargetDrawPosition },
  } = positionTargets({
    inContextDrawMatchUps,
    drawDefinition,
    matchUpId,
    structure,
  });

  // only handling situation where winningMatchUp is in same structure
  if (winnerMatchUp && winnerMatchUp.structureId === structure.structureId) {
    // NOTE: error conditions are ignored
    advanceWinner({
      drawPositionToAdvance,
      inContextDrawMatchUps,
      sourceDrawPositions,
      tournamentRecord,
      drawDefinition,
      winnerMatchUp,
      matchUpsMap,
      event,
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
        structureId: loserTargetLink.target.structureId,
        drawPosition: loserTargetDrawPosition,
        iterative: 'brightyellow',
        tournamentRecord,
        drawDefinition,
      });
      if (result.error) return result;
    } else {
      assignFedDrawPositionBye({
        loserTargetDrawPosition,
        tournamentRecord,
        loserTargetLink,
        drawDefinition,
        loserMatchUp,
        matchUpsMap,
      });
    }
  }

  return { ...SUCCESS };
}

function advanceWinner({
  drawPositionToAdvance,
  inContextDrawMatchUps,
  sourceDrawPositions,
  tournamentRecord,
  drawDefinition,
  winnerMatchUp,
  matchUpsMap,
  event,
}) {
  const stack = 'advanceWinner';
  const noContextWinnerMatchUp = matchUpsMap.drawMatchUps.find(
    (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
  );
  const inContextMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === winnerMatchUp.matchUpId
  );
  const structureId = inContextMatchUp?.structureId;
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = getPositionAssignments({ structure });
  const drawPositionToAdvanceAssigment = positionAssignments.find(
    ({ drawPosition }) => drawPosition === drawPositionToAdvance
  );
  const drawPositionToAdvanceIsBye = drawPositionToAdvanceAssigment.bye;
  const existingDrawPositions =
    noContextWinnerMatchUp.drawPositions?.filter(Boolean);
  const existingAssignments = positionAssignments.filter((assignment) =>
    existingDrawPositions?.includes(assignment.drawPosition)
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
  if (isByeAdvancedBye) console.log({ isByeAdvancedBye });
  /// ????????????????????????????????????????

  if (
    existingDrawPositions?.length > 1 &&
    drawPositionToAdvanceIsBye &&
    !priorPairIsBye
  ) {
    return decorateResult({ result: { error: DRAW_POSITION_ASSIGNED }, stack });
  }
  const pairedDrawPosition = existingDrawPositions?.find(
    (drawPosition) => drawPosition !== drawPositionToAdvance
  );

  let drawPositionAssigned = isByeAdvancedBye;
  // always ensure there are two drawPositions to iterate over
  const twoDrawPositions = []
    .concat(
      ...(noContextWinnerMatchUp.drawPositions || []).filter(Boolean),
      undefined,
      undefined
    )
    .slice(0, 2);

  const drawPositions = twoDrawPositions.map((position) => {
    if (!position && !drawPositionAssigned) {
      drawPositionAssigned = true;
      return drawPositionToAdvance;
    } else if (position === drawPositionToAdvance) {
      drawPositionAssigned = true;
      return drawPositionToAdvance;
    } else {
      return position;
    }
  });

  if (!drawPositionAssigned) {
    console.log('@@@@@@@', {
      advancingAssignmentIsBye,
      drawPositionToAdvance,
      existingAssignments,
    });
    return decorateResult({ result: { error: DRAW_POSITION_ASSIGNED }, stack });
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

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    matchUp: noContextWinnerMatchUp,
    eventId: event?.eventId,
    context: stack,
    drawDefinition,
  });

  if (pairedDrawPositionIsBye || drawPositionIsBye) {
    const advancingDrawPosition = pairedDrawPositionIsBye
      ? drawPositionToAdvance
      : pairedDrawPosition;

    if (advancingDrawPosition) {
      advanceDrawPosition({
        drawPositionToAdvance: advancingDrawPosition,
        matchUpId: winnerMatchUp.matchUpId,
        inContextDrawMatchUps,
        tournamentRecord,
        drawDefinition,
        matchUpsMap,
      });
    } else if (drawPositionIsBye) {
      const {
        targetLinks: { loserTargetLink },
        targetMatchUps: { loserMatchUp, loserTargetDrawPosition },
      } = positionTargets({
        matchUpId: winnerMatchUp.matchUpId,
        structure,
        drawDefinition,
        inContextDrawMatchUps,
      });
      if (loserTargetLink && loserMatchUp) {
        if (loserMatchUp.feedRound) {
          assignFedDrawPositionBye({
            loserTargetDrawPosition,
            tournamentRecord,
            loserTargetLink,
            drawDefinition,
            loserMatchUp,
            matchUpsMap,
          });
        } else {
          const sourceStructureRoundPosition = winnerMatchUp.roundPosition;
          // loser drawPosition in target structure is determined bye even/odd
          const targetDrawPositionIndex =
            1 - (sourceStructureRoundPosition % 2);
          const targetDrawPosition =
            loserMatchUp.drawPositions[targetDrawPositionIndex];

          const result = assignDrawPositionBye({
            structureId: loserTargetLink.target.structureId,
            drawPosition: targetDrawPosition,
            loserTargetDrawPosition,
            iterative: 'brightgreen',
            tournamentRecord,
            drawDefinition,
          });
          if (result.error) return result;
        }
      }
    }
  }
}

function assignFedDrawPositionBye({
  loserTargetDrawPosition,
  tournamentRecord,
  loserTargetLink,
  drawDefinition,
  loserMatchUp,
  matchUpsMap,
}) {
  const { roundNumber } = loserMatchUp;

  const mappedMatchUps = matchUpsMap?.mappedMatchUps || {};
  const loserStructureMatchUps =
    mappedMatchUps[loserMatchUp.structureId].matchUps;
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition: loserTargetDrawPosition,
    matchUps: loserStructureMatchUps,
  });
  if (initialRoundNumber === roundNumber) {
    const result = assignDrawPositionBye({
      structureId: loserTargetLink.target.structureId,
      drawPosition: loserTargetDrawPosition,
      tournamentRecord,
      iterative: 'red',
      drawDefinition,
    });
    if (result.error) return result;
  }
}
