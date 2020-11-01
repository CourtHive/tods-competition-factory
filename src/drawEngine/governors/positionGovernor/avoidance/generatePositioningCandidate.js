import { randomPop, intersection } from '../../../../utilities/arrays';
import { assignDrawPosition } from '../positionAssignment';
import { extractAttributeValues } from '../../../getters/getAttributeGrouping';

import { organizeDrawPositionOptions } from './organizeDrawPositionOptions';
import { getParticipantGroups } from './analyzeDrawPositions';
import { getUnfilledPositions } from './getUnfilledPositions';
import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';
import { getNextParticipantId } from './getNextParticipantId';

import { chunkArray, generateRange, makeDeepCopy } from '../../../../utilities';
import { getRoundRobinGroupMatchUps } from '../../../generators/roundRobinGroups';

import { GROUP, PAIR, TEAM } from '../../../../constants/participantTypes';

/**
 *
 * @param {object} initialPositionAssignments
 *
 */
export function generatePositioningCandidate({
  initialPositionAssignments,
  participantsWithContext,
  unseededParticipantIds,
  opponentsToPlaceCount,
  drawPositionChunks,
  drawPositionGroups,
  policyAttributes,
  drawDefinition,
  pairedPriority,
  structureId,
  allGroups,
}) {
  const idCollections = {};
  idCollections.groupParticipants = participantsWithContext
    .filter(participant => participant.participantType === GROUP)
    .map(participant => participant.participantId);
  idCollections.teamParticipants = participantsWithContext
    .filter(participant => participant.participantType === TEAM)
    .map(participant => participant.participantId);
  idCollections.pairParticipants = participantsWithContext
    .filter(participant => participant.participantType === PAIR)
    .map(participant => participant.participantId);

  const errors = [];
  let groupKey, selectedParticipantId;
  let candidatePositionAssignments = makeDeepCopy(initialPositionAssignments);
  const candidateDrawDefinition = makeDeepCopy(drawDefinition);

  const largestGroupSize = drawPositionGroups.reduce((largest, group) => {
    return group.length > largest ? group.length : largest;
  }, 0);
  const useSpecifiedGroupKey = !!(largestGroupSize > 2);

  generateRange(0, opponentsToPlaceCount).forEach(() => {
    const targetParticipantIds = getUnplacedParticipantIds({
      participantIds: unseededParticipantIds,
      positionAssignments: candidatePositionAssignments,
    });

    const unfilledPositions = getUnfilledPositions({
      drawPositionGroups,
      positionAssignments: candidatePositionAssignments,
    });

    ({ participantId: selectedParticipantId, groupKey } = getNextParticipantId({
      groupKey,
      idCollections,
      policyAttributes,
      targetParticipantIds,
      useSpecifiedGroupKey,
      participants: participantsWithContext,
    }));

    const selectedParticipantGroups = getParticipantGroups({
      allGroups,
      participantId: selectedParticipantId,
    });

    const drawPositionOptions = organizeDrawPositionOptions({
      allGroups,
      largestGroupSize,
      unfilledPositions,
      drawPositionChunks,
      isRoundRobin: useSpecifiedGroupKey,
      positionAssignments: candidatePositionAssignments,
      selectedParticipantGroups,
    });
    const { unassigned, unpaired, pairedNoConflict } = drawPositionOptions;

    // the first element of each options array represents the greatest possible round separation
    const pnc = pairedNoConflict?.length && pairedNoConflict[0];
    const up = unpaired?.length && unpaired[0];
    const desiredOptions = pairedPriority && pnc ? pnc : up;
    const fallbackOptions = pairedPriority ? up : pnc;

    const prioritizedOptions =
      (desiredOptions?.length && desiredOptions) ||
      (fallbackOptions?.length && fallbackOptions);

    let targetDrawPosition;
    if (prioritizedOptions?.length) {
      const section = randomPop(prioritizedOptions);
      targetDrawPosition = randomPop(section);
    } else {
      const section = randomPop(unassigned[0]);
      targetDrawPosition = randomPop(section);
    }

    const result = assignDrawPosition({
      structureId,
      drawPosition: targetDrawPosition,
      participantId: selectedParticipantId,
      drawDefinition: candidateDrawDefinition,
    });
    if (result.success) {
      candidatePositionAssignments = result.positionAssignments;
    } else {
      console.log('ERROR:', result.error, { targetDrawPosition });
      errors.push(result.error);
    }
  });

  const participantsMap = Object.assign(
    {},
    ...participantsWithContext.map(participant => ({
      [participant.participantId]: participant,
    }))
  );

  const positionedParticipants = candidatePositionAssignments.map(
    assignment => {
      const participant = participantsMap[assignment.participantId];
      const { values } = extractAttributeValues({
        participant,
        policyAttributes,

        idCollections,
        participants: participantsWithContext,
      });
      return Object.assign({}, assignment, { values });
    }
  );

  let avoidanceConflicts = 0;
  const groupSize = Math.min(...drawPositionGroups.map(dpg => dpg.length));
  const isRoundRobin = groupSize > 2;
  const groupedParticipants = chunkArray(positionedParticipants, groupSize);

  if (isRoundRobin) {
    groupedParticipants.forEach(participantGroup => {
      const drawPositions = participantGroup.map(
        participant => participant.drawPosition
      );
      const { uniqueMatchUpGroupings } = getRoundRobinGroupMatchUps({
        drawPositions,
      });
      const drawPositionValuesMap = Object.assign(
        {},
        ...participantGroup.map(participant => ({
          [participant.drawPosition]: participant,
        }))
      );
      uniqueMatchUpGroupings.forEach(grouping => {
        const avoidanceConflict = intersection(
          drawPositionValuesMap[grouping[0]].values,
          drawPositionValuesMap[grouping[1]].values
        ).length;

        if (avoidanceConflict) {
          avoidanceConflicts++;
          participantGroup.conflict = true;
        }
      });
    });
  } else {
    groupedParticipants.forEach(matchUpPair => {
      const avoidanceConflict = intersection(
        matchUpPair[0].values,
        matchUpPair[1].values
      ).length;

      if (avoidanceConflict) {
        avoidanceConflicts++;
        matchUpPair.conflict = true;
      }
    });
  }

  return {
    positionAssignments: candidatePositionAssignments,
    conflicts: avoidanceConflicts,
    groupedParticipants,
    errors,
  };
}
