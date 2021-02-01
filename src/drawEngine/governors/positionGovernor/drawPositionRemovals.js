import { modifyRoundRobinMatchUpsStatus } from '../matchUpGovernor/modifyRoundRobinMatchUpsStatus';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { intersection, numericSort } from '../../../utilities';
import { findStructure } from '../../getters/findStructure';
import { addNotice } from '../../../global/globalState';
import { positionTargets } from './positionTargets';
import {
  getPositionAssignments,
  structureAssignedDrawPositions,
} from '../../getters/positionsGetter';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';
import { CONTAINER } from '../../../constants/drawDefinitionConstants';

/**
 *
 * @param {object} drawDefinition
 * @param {object} mappedMatchUps
 * @param {object[]} inContextDrawMatchUps
 * @param {string} structureId
 * @param {number} drawPosition
 *
 */
export function drawPositionRemovals({
  drawDefinition,
  mappedMatchUps,
  inContextDrawMatchUps,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({
    drawDefinition,
    structure,
  });

  const drawPositionCleared = positionAssignments.reduce(
    (cleared, assignment) => {
      if (assignment.drawPosition === drawPosition) {
        assignment.participantId = undefined;
        delete assignment.qualifier;
        delete assignment.bye;
        return true;
      }
      return cleared;
    },
    false
  );

  if (structure.structureType === CONTAINER) {
    modifyRoundRobinMatchUpsStatus({
      positionAssignments,
      drawDefinition,
      structure,
    });
    return { drawPositionCleared };
  }

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps: structureMatchUps } = getAllStructureMatchUps({
    drawDefinition,
    mappedMatchUps,
    matchUpFilters,
    structure,
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
      const relevantPair = roundProfile[
        roundNumber
      ].pairedDrawPositions.find((drawPositions) =>
        drawPositions.includes(targetDrawPosition)
      );
      const pairedDrawPosition = relevantPair?.find(
        (currentDrawPosition) => currentDrawPosition !== targetDrawPosition
      );
      const pairedDrawPositionAssignment = positionAssignments.find(
        (assignment) => assignment.drawPosition === pairedDrawPosition
      );
      const nextRoundProfile = roundProfile[roundNumber + 1];
      const pairedDrawPositionIsBye = pairedDrawPositionAssignment?.bye;
      const pairedDrawPositionInNextRound =
        nextRoundProfile &&
        nextRoundProfile.pairedDrawPositions.find((pairedPositions) =>
          pairedPositions.includes(pairedDrawPosition)
        );
      const isTransitiveBye =
        pairedDrawPositionIsBye && pairedDrawPositionInNextRound;
      nextRoundProfile &&
        nextRoundProfile.drawPositions.includes(pairedDrawPosition);
      const pairedDrawPositionByeAdvancedPair =
        !isTransitiveBye && pairedDrawPositionInNextRound;
      if (pairedDrawPositionAssignment) {
        const result = {
          roundNumber,
          relevantPair,
          pairedDrawPosition,
          pairedDrawPositionByeAdvancedPair,
          targetDrawPosition,
        };
        // if the pairedDrawPosition is a BYE, continue search with pairedDrawPoaition as targetDrawPosition
        if (isTransitiveBye) targetDrawPosition = pairedDrawPosition;
        return result;
      }
    })
    .filter((f) => f);

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
    const newTasks = [roundRemoval, byeAdvancedRemoval].filter((f) => f);
    return tasks.concat(...newTasks);
  }, []);

  tasks.forEach(({ roundNumber, targetDrawPosition, relevantPair }) => {
    const targetMatchUp = roundMatchUps[roundNumber].find(
      (matchUp) =>
        intersection(matchUp.drawPositions, relevantPair).length === 2
    );
    if (!targetMatchUp) {
      return;
    }
    removeSubsequentRoundsParticipant({
      drawDefinition,
      mappedMatchUps,
      inContextDrawMatchUps,
      structureId,
      roundNumber,
      targetDrawPosition,
    });
    removeDrawPosition({
      drawDefinition,
      structure,
      mappedMatchUps,
      inContextDrawMatchUps,
      targetMatchUp,
      drawPosition,
    });
  });

  return { tasks, drawPositionCleared };
}

function removeDrawPosition({
  drawDefinition,
  structure,
  mappedMatchUps,
  inContextDrawMatchUps,
  targetMatchUp,
  drawPosition,
}) {
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });
  const matchUps = mappedMatchUps[structure.structureId].matchUps;
  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition,
    matchUps,
  });
  if (targetMatchUp.roundNumber > initialRoundNumber) {
    targetMatchUp.drawPositions = (targetMatchUp.drawPositions || []).map(
      (currentDrawPosition) => {
        return currentDrawPosition === drawPosition
          ? undefined
          : currentDrawPosition;
      }
    );
  }
  const sourceMatchUpWinnerDrawPositionIndex = targetMatchUp.drawPositions.indexOf(
    drawPosition
  );
  const targetData = positionTargets({
    matchUpId: targetMatchUp.matchUpId,
    structure,
    drawDefinition,
    mappedMatchUps,
    inContextDrawMatchUps,
    sourceMatchUpWinnerDrawPositionIndex,
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

  const { positionAssignments } = getPositionAssignments({ structure });
  const matchUpAssignments = positionAssignments.filter(({ drawPosition }) =>
    targetMatchUp.drawPositions.includes(drawPosition)
  );
  const matchUpContainsBye = matchUpAssignments.filter(
    (assignment) => assignment.bye
  ).length;

  const matchUpStatus = matchUpContainsBye ? BYE : TO_BE_PLAYED;
  Object.assign(targetMatchUp, { matchUpStatus });
  addNotice({
    topic: 'modifyMatchUp',
    payload: { matchUp: targetMatchUp },
  });

  if (
    loserMatchUp &&
    loserMatchUp.structureId !== targetData.matchUp.structureId
  ) {
    const { drawPositions } = loserMatchUp;
    const loserMatchUpDrawPosition =
      drawPositions[loserMatchUpDrawPositionIndex];

    // if source matchUp contains BYE don't removed directed BYE
    if (!matchUpContainsBye) {
      drawPositionRemovals({
        inContextDrawMatchUps,
        drawDefinition,
        mappedMatchUps,
        structureId: loserMatchUp.structureId,
        drawPosition: loserMatchUpDrawPosition,
      });
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

export function removeSubsequentRoundsParticipant({
  drawDefinition,
  mappedMatchUps,
  structureId,
  roundNumber,
  inContextDrawMatchUps,
  targetDrawPosition,
}) {
  if (!mappedMatchUps && !drawDefinition) {
    console.log('ERROR: missing params');
    return;
  }
  const { structure } = findStructure({ drawDefinition, structureId });
  if (structure.structureType === CONTAINER) return;

  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });
  const matchUps = mappedMatchUps[structureId].matchUps;

  const { initialRoundNumber } = getInitialRoundNumber({
    drawPosition: targetDrawPosition,
    matchUps,
  });

  const relevantMatchUps = matchUps?.filter(
    (matchUp) =>
      matchUp.roundNumber >= roundNumber &&
      matchUp.roundNumber !== initialRoundNumber &&
      matchUp.drawPositions.includes(targetDrawPosition)
  );

  relevantMatchUps?.forEach((matchUp) => {
    removeDrawPosition({
      drawDefinition,
      structure,
      mappedMatchUps,
      inContextDrawMatchUps,
      targetMatchUp: matchUp,
      drawPosition: targetDrawPosition,
    });
  });
}

function getInitialRoundNumber({ drawPosition, matchUps = [] }) {
  // determine the initial round where drawPosition appears
  // drawPosition cannot be removed from its initial round
  const initialRoundNumber = matchUps
    .filter(
      ({ drawPositions }) =>
        drawPosition && drawPositions.includes(drawPosition)
    )
    .map(({ roundNumber }) => parseInt(roundNumber))
    .sort(numericSort)[0];
  return { initialRoundNumber };
}
