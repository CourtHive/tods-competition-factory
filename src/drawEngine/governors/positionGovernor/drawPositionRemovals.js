import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { getRoundMatchUps } from '../../accessors/matchUpAccessor/getRoundMatchUps';
import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { findStructure } from '../../getters/findStructure';
import { positionTargets } from './positionTargets';
import { intersection } from '../../../utilities';

import { BYE, TO_BE_PLAYED } from '../../../constants/matchUpStatusConstants';

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
    };
    const newTasks = [roundRemoval, byeAdvancedRemoval].filter((f) => f);
    return tasks.concat(...newTasks);
  }, []);

  tasks.forEach(({ roundNumber, targetDrawPosition, relevantPair }) => {
    const targetMatchUp = roundMatchUps[roundNumber].find(
      (matchUp) =>
        intersection(matchUp.drawPositions, relevantPair).length === 2
    );
    targetMatchUp.matchUpStatus = TO_BE_PLAYED;
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
      targetLinks: { loserTargetLink, winnerTargetLink },
      targetMatchUps: {
        loserMatchUp,
        winnerMatchUp,
        loserMatchUpDrawPositionIndex,
        winnerMatchUpDrawPositionIndex,
      },
    } = targetData;

    if (roundNumber !== 1) {
      targetMatchUp.drawPositions = targetMatchUp.drawPositions.map(
        (drawPosition) =>
          drawPosition !== targetDrawPosition ? drawPosition : undefined
      );
    }

    if (
      loserMatchUp &&
      loserMatchUp.matchUpStatus === BYE &&
      loserMatchUp.structureId !== targetData.matchUp.structureId
    ) {
      const { drawPositions /*, roundNumber, roundPosition*/ } = loserMatchUp;
      // const targetDrawPosition = drawPositions[loserMatchUpDrawPositionIndex];
      /*
      console.log({
        roundNumber,
        roundPosition,
        drawPositions,
        loserTargetLink,
        targetDrawPosition,
        loserMatchUpDrawPositionIndex,
      });
      */
      drawPositionRemovals({
        inContextDrawMatchUps,
        drawDefinition,
        mappedMatchUps,
        structureId: loserMatchUp.structureId,
        drawPosition: drawPositions[loserMatchUpDrawPositionIndex],
      });
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
  });
  return { tasks, drawPositionCleared };
}
