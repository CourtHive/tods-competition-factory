import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getInitialRoundNumber } from '../../getters/getInitialRoundNumber';
import { modifyMatchUpNotice } from '../../notifications/drawNotifications';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { findStructure } from '../../getters/findStructure';
import { positionTargets } from './positionTargets';
import { overlap } from '../../../utilities';
import {
  getPositionAssignments,
  structureAssignedDrawPositions,
} from '../../getters/positionsGetter';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  BYE,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

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
    return { drawPositionCleared };
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
        roundNumber,
        relevantPair,
        pairedDrawPosition,
        pairedDrawPositionByeAdvancedPair,
        targetDrawPosition,
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

  targetMatchUp.matchUpStatus = matchUpContainsBye
    ? BYE
    : targetMatchUp.matchUpStatus === WALKOVER
    ? WALKOVER
    : TO_BE_PLAYED;

  // if the matchUpStatus is WALKOVER then it is DOUBLE_WALKOVER produced
  // ... and the winningSide must be removed
  if (targetMatchUp.matchUpStatus === WALKOVER)
    targetMatchUp.winningSide = undefined;

  modifyMatchUpNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    matchUp: targetMatchUp,
    drawDefinition,
  });

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

        const mappedMatchUps = matchUpsMap?.mappedMatchUps || {};
        const loserStructureMatchUps =
          mappedMatchUps[loserMatchUp.structureId].matchUps;

        const { initialRoundNumber } = getInitialRoundNumber({
          drawPosition: loserMatchUpDrawPosition,
          matchUps: loserStructureMatchUps,
        });
        // if clearing a drawPosition from a feed round the initialRoundNumber for the drawPosition must equal the roundNumber
        if (initialRoundNumber === roundNumber) {
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
    winnerMatchUp.structureId !== targetData.matchUp.structureId
  ) {
    console.log('linked structure winnerMatchUp removal', {
      winnerTargetLink,
      winnerMatchUpDrawPositionIndex,
    });
  }
}
