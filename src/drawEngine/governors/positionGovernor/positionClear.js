import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { getStructureDrawPositionProfiles } from '../../getters/getStructureDrawPositionProfiles';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { decorateResult } from '../../../global/functions/decorateResult';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { pushGlobalLog } from '../../../global/functions/globalLog';
import { findStructure } from '../../getters/findStructure';
import { positionTargets } from './positionTargets';
import { overlap } from '../../../utilities';
import {
  getPositionAssignments,
  structureAssignedDrawPositions,
} from '../../getters/positionsGetter';
import {
  modifyPositionAssignmentsNotice,
  modifyMatchUpNotice,
} from '../../notifications/drawNotifications';

import { SUCCESS } from '../../../constants/resultConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  CONTAINER,
  DRAW,
  QUALIFYING,
} from '../../../constants/drawDefinitionConstants';
import {
  BYE,
  DEFAULTED,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

import {
  DRAW_POSITION_ACTIVE,
  MISSING_DRAW_POSITION,
  DRAW_POSITION_NOT_CLEARED,
} from '../../../constants/errorConditionConstants';

/**
 *
 * @param {object} drawDefinition - automatically added if drawEngine state has been set
 * @param {number} drawPosition - number of drawPosition for which actions are to be returned
 * @param {string} structureId - id of structure of drawPosition
 * @param {string} participantId - id of participant to be removed
 *
 */
export function clearDrawPosition({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  participantId,
  structureId,
  matchUpsMap,
  event,
}) {
  const stack = 'clearDrawPosition';
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({
    drawDefinition,
    structure,
  });

  const existingAssignment = positionAssignments.find(
    (assignment) =>
      (participantId && assignment.participantId === participantId) ||
      (drawPosition && assignment.drawPosition === drawPosition)
  );

  if (participantId && !drawPosition) {
    drawPosition = existingAssignment?.drawPosition;
  }
  if (!drawPosition) return { error: MISSING_DRAW_POSITION };
  if (!participantId) participantId = existingAssignment?.participantId;

  const { activeDrawPositions } = getStructureDrawPositionProfiles({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);

  // drawPosition may not be cleared if:
  // 1. drawPosition has been advanced by winning a matchUp
  // 2. drawPosition is paired with another drawPosition which has been advanced by winning a matchUp
  if (drawPositionIsActive) {
    return { error: DRAW_POSITION_ACTIVE };
  }

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  const result = drawPositionRemovals({
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    drawPosition,
    matchUpsMap,
    event,
  });
  if (result.error) return result;

  if (!result.drawPositionCleared) return { error: DRAW_POSITION_NOT_CLEARED };

  modifyPositionAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    source: stack,
    structure,
    event,
  });

  return { ...SUCCESS, participantId };
}

/**
 *
 * @param {object} drawDefinition
 * @param {string} structureId
 * @param {number} drawPosition
 *
 * @param {object} matchUpsMap
 * @param {object[]} inContextDrawMatchUps
 *
 */
export function drawPositionRemovals({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  drawPosition,
  matchUpsMap,
  structureId,
  event,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({
    drawDefinition,
    structure,
  });

  const drawPositionCleared = positionAssignments.some((assignment) => {
    if (assignment.drawPosition === drawPosition) {
      delete assignment.participantId;
      delete assignment.qualifier;
      delete assignment.bye;
      return true;
    }
  });

  if (structure.structureType === CONTAINER) {
    modifyRoundRobinMatchUpsStatus({
      positionAssignments,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      structure,
    });
    return { drawPositionCleared, ...SUCCESS };
  }

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps: structureMatchUps } = getAllStructureMatchUps({
    drawDefinition,
    matchUpFilters,
    matchUpsMap,
    structure,
    event,
  });
  const { roundProfile, roundMatchUps } = getRoundMatchUps({
    matchUps: structureMatchUps,
  });
  const roundNumbers = Object.keys(roundProfile).map((roundNumber) =>
    parseInt(roundNumber)
  );

  let targetDrawPosition = drawPosition;
  const pairingDetails = roundNumbers
    .map((roundNumber) => {
      // find the pair of drawPositions which includes the targetDrawPosition
      const relevantPair = roundProfile[roundNumber].pairedDrawPositions.find(
        (drawPositions) => drawPositions.includes(targetDrawPosition)
      );
      // find the drawPosition which is paired with the targetDrawPosition
      const pairedDrawPosition = relevantPair?.find(
        (currentDrawPosition) => currentDrawPosition !== targetDrawPosition
      );
      // find the assignment for the paired drawPosition
      const pairedDrawPositionAssignment = positionAssignments.find(
        (assignment) => assignment.drawPosition === pairedDrawPosition
      );
      const nextRoundProfile = roundProfile[roundNumber + 1];
      // whether or not the pairedDrawPosition is a BYE
      const pairedDrawPositionIsBye = pairedDrawPositionAssignment?.bye;
      // whether or not the pairedDrawPosition is present in the next round
      const pairedDrawPositionInNextRound =
        nextRoundProfile &&
        nextRoundProfile.pairedDrawPositions.find((pairedPositions) =>
          pairedPositions.includes(pairedDrawPosition)
        );
      // pairedDrawPosition is a transitiveBye if it is a BYE and if it is present in next round
      const isTransitiveBye =
        pairedDrawPositionIsBye &&
        pairedDrawPositionInNextRound &&
        nextRoundProfile &&
        nextRoundProfile.drawPositions?.includes(pairedDrawPosition);
      const pairedDrawPositionByeAdvancedPair =
        !isTransitiveBye && pairedDrawPositionInNextRound;

      const result = relevantPair && {
        pairedDrawPositionByeAdvancedPair,
        pairedDrawPosition,
        targetDrawPosition,
        relevantPair,
        roundNumber,
      };

      // if the pairedDrawPosition is a BYE, continue search with pairedDrawPoaition as targetDrawPosition
      if (isTransitiveBye) targetDrawPosition = pairedDrawPosition;

      return result;
    })
    .filter((f) => f?.targetDrawPosition);

  const tasks = pairingDetails.reduce((tasks, pairingDetail) => {
    const {
      roundNumber,
      relevantPair,
      targetDrawPosition,
      pairedDrawPosition,
      pairedDrawPositionByeAdvancedPair,
    } = pairingDetail;
    const roundRemoval = { roundNumber, targetDrawPosition, relevantPair };
    const byeAdvancedRemoval = pairedDrawPositionByeAdvancedPair && {
      roundNumber: roundNumber + 1,
      targetDrawPosition: pairedDrawPosition,
      relevantPair: pairedDrawPositionByeAdvancedPair,
      subsequentRoundRemoval: true,
    };
    const newTasks = [roundRemoval, byeAdvancedRemoval].filter(Boolean);
    return tasks.concat(...newTasks);
  }, []);

  tasks.forEach(({ roundNumber, targetDrawPosition, relevantPair }) => {
    const targetMatchUp = roundMatchUps[roundNumber].find((matchUp) =>
      overlap(
        matchUp.drawPositions.filter(Boolean),
        relevantPair.filter(Boolean)
      )
    );
    if (!targetMatchUp) {
      return;
    }

    removeSubsequentRoundsParticipant({
      inContextDrawMatchUps,
      targetDrawPosition,
      tournamentRecord,
      drawDefinition,
      structureId,
      roundNumber,
      matchUpsMap,
      event,
    });

    removeDrawPosition({
      inContextDrawMatchUps,
      positionAssignments,
      tournamentRecord,
      drawDefinition,
      targetMatchUp,
      drawPosition,
      matchUpsMap,
      structure,
      event,
    });
  });

  return { tasks, drawPositionCleared, positionAssignments };
}

function removeSubsequentRoundsParticipant({
  inContextDrawMatchUps,
  targetDrawPosition,
  tournamentRecord,
  drawDefinition,
  matchUpsMap,
  roundNumber,
  structureId,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  if (structure.structureType === CONTAINER) return;

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });
  const mappedMatchUps = matchUpsMap?.mappedMatchUps || {};
  const matchUps = mappedMatchUps[structureId].matchUps;

  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition: targetDrawPosition,
    matchUps,
  });

  const relevantMatchUps = matchUps?.filter(
    (matchUp) =>
      matchUp.roundNumber >= roundNumber &&
      matchUp.roundNumber !== initialRoundNumber &&
      matchUp.drawPositions?.includes(targetDrawPosition)
  );

  const { positionAssignments } = getPositionAssignments({
    drawDefinition,
    structureId,
  });

  relevantMatchUps?.forEach((matchUp) =>
    removeDrawPosition({
      drawPosition: targetDrawPosition,
      targetMatchUp: matchUp,
      inContextDrawMatchUps,
      positionAssignments,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      structure,
    })
  );
}

function removeDrawPosition({
  inContextDrawMatchUps,
  positionAssignments,
  tournamentRecord,
  drawDefinition,
  targetMatchUp,
  drawPosition,
  matchUpsMap,
  structure,
  event,
}) {
  const stack = 'removeDrawPosition';
  const initialDrawPositions = targetMatchUp.drawPositions.slice();
  const initialMatchUpStatus = targetMatchUp.matchUpStatus;
  const initialWinningSide = targetMatchUp.winningSide;

  matchUpsMap = matchUpsMap || getMatchUpsMap({ drawDefinition });
  const mappedMatchUps = matchUpsMap.mappedMatchUps;
  const matchUps = mappedMatchUps[structure.structureId].matchUps;
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition,
    matchUps,
  });

  if (targetMatchUp.roundNumber > initialRoundNumber) {
    targetMatchUp.drawPositions = (targetMatchUp.drawPositions || []).map(
      (currentDrawPosition) =>
        // UNDEFINED drawPositions
        currentDrawPosition === drawPosition ? undefined : currentDrawPosition
    );
  }

  if (targetMatchUp.matchUpType === TEAM) {
    const inContextTargetMatchUp = inContextDrawMatchUps?.find(
      (matchUp) => matchUp.matchUpId === targetMatchUp.matchUpId
    );
    const drawPositionSideIndex = inContextTargetMatchUp?.sides?.reduce(
      (index, side, i) => (side.drawPosition === drawPosition ? i : index),
      undefined
    );

    if (
      drawPositionSideIndex !== undefined &&
      targetMatchUp.sides?.[drawPositionSideIndex]?.lineUp
    ) {
      delete targetMatchUp.sides?.[drawPositionSideIndex].lineUp;

      modifyMatchUpNotice({
        tournamentId: tournamentRecord?.tournamentId,
        eventId: event?.eventId,
        matchUp: targetMatchUp,
        context: `${stack}-TEAM`,
        drawDefinition,
      });
    }
  }

  const targetData = positionTargets({
    matchUpId: targetMatchUp.matchUpId,
    inContextDrawMatchUps,
    drawDefinition,
    structure,
  });

  const {
    targetLinks: { winnerTargetLink },
    targetMatchUps: {
      loserMatchUp,
      winnerMatchUp,
      loserMatchUpDrawPositionIndex,
      winnerMatchUpDrawPositionIndex,
    },
  } = targetData;

  const matchUpAssignments = positionAssignments.filter(({ drawPosition }) =>
    targetMatchUp.drawPositions?.includes(drawPosition)
  );
  const matchUpContainsBye = matchUpAssignments.filter(
    (assignment) => assignment.bye
  ).length;

  const newMatchUpStatus = matchUpContainsBye
    ? BYE
    : [DEFAULTED, WALKOVER].includes(targetMatchUp.matchUpStatus)
    ? targetMatchUp.matcHUpStatus
    : targetMatchUp.drawPositions.length === 2
    ? TO_BE_PLAYED
    : undefined;

  targetMatchUp.matchUpStatus = newMatchUpStatus;

  // if the matchUpStatus is WALKOVER then it is DOUBLE_WALKOVER produced
  // if the matchUpStatus is DEFAULTED then it is DOUBLE_DEFAULT produced
  // ... and the winningSide must be removed
  if ([WALKOVER, DEFAULTED].includes(targetMatchUp.matchUpStatus))
    targetMatchUp.winningSide = undefined;

  const removedDrawPosition = initialDrawPositions.find(
    (position) => !targetMatchUp.drawPositions.includes(position)
  );
  const noChange =
    initialDrawPositions.includes(drawPosition) &&
    initialMatchUpStatus === targetMatchUp.matchUpStatus &&
    initialWinningSide === targetMatchUp.winningSide;

  if (!noChange) {
    if (removedDrawPosition) {
      pushGlobalLog({
        method: stack,
        color: 'brightyellow',
        removedDrawPosition,
      });
    }

    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      eventId: event?.eventId,
      matchUp: targetMatchUp,
      context: `${stack}-${drawPosition}`,
      drawDefinition,
    });
  }

  if (
    loserMatchUp &&
    loserMatchUp.structureId !== targetData.matchUp.structureId
  ) {
    // if source matchUp contains BYE don't removed directed BYE
    if (!matchUpContainsBye) {
      const { drawPositions, roundNumber } = loserMatchUp;

      if (roundNumber === 1) {
        const loserMatchUpDrawPosition =
          drawPositions[loserMatchUpDrawPositionIndex];

        drawPositionRemovals({
          structureId: loserMatchUp.structureId,
          drawPosition: loserMatchUpDrawPosition,
          inContextDrawMatchUps,
          tournamentRecord,
          drawDefinition,
          matchUpsMap,
        });
      } else {
        // for fed rounds the loserMatchUpDrawPosiiton is always the fed drawPosition
        // which is always the lowest numerical drawPosition
        const loserMatchUpDrawPosition = Math.min(
          ...drawPositions.filter(Boolean)
        );

        const result = consolationCleanup({
          loserMatchUpDrawPosition,
          inContextDrawMatchUps,
          tournamentRecord,
          drawDefinition,
          loserMatchUp,
          matchUpsMap,
          event,
        });
        if (result.error) return decorateResult({ result, stack });

        const mappedMatchUps = matchUpsMap?.mappedMatchUps || {};
        const loserStructureMatchUps =
          mappedMatchUps[loserMatchUp.structureId].matchUps;

        const { initialRoundNumber } = getInitialRoundNumber({
          drawPosition: loserMatchUpDrawPosition,
          matchUps: loserStructureMatchUps,
        });

        // if clearing a drawPosition from a feed round the initialRoundNumber for the drawPosition must be { roundNumber: 1 }
        if (initialRoundNumber === 1) {
          pushGlobalLog({
            method: stack,
            color: 'brightyellow',
            loserMatchUpDrawPosition,
          });

          drawPositionRemovals({
            structureId: loserMatchUp.structureId,
            drawPosition: loserMatchUpDrawPosition,
            inContextDrawMatchUps,
            tournamentRecord,
            drawDefinition,
            matchUpsMap,
          });
        }
      }
    }
  }

  if (
    winnerMatchUp &&
    winnerMatchUp.structureId !== targetData.matchUp.structureId &&
    // does not apply to traversals that are based on QUALIFYING
    winnerTargetLink.target.feedProfile !== DRAW
  ) {
    const { structure } = findStructure({
      structureId: targetData.matchUp.structureId,
      drawDefinition,
    });

    if (structure.structureType !== QUALIFYING)
      console.log('linked structure winnerMatchUp removal', {
        winnerMatchUpDrawPositionIndex,
        winnerTargetLink,
      });
  }

  return { ...SUCCESS };
}

function consolationCleanup({
  loserMatchUpDrawPosition,
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  loserMatchUp,
  matchUpsMap,
  event,
}) {
  const { structure } = findStructure({
    structureId: loserMatchUp.structureId,
    drawDefinition,
  });
  const { positionAssignments } = getPositionAssignments({ structure });
  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition === loserMatchUpDrawPosition
  );

  if (assignment.bye) {
    const result = clearDrawPosition({
      drawPosition: loserMatchUpDrawPosition,
      structureId: loserMatchUp.structureId,
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      matchUpsMap,
      event,
    });
    if (result.error) return result;
  }

  return { ...SUCCESS };
}
