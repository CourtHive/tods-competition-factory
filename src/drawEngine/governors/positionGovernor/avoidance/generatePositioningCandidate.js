import { randomPop, intersection } from '../../../../utilities/arrays';
import { assignDrawPosition } from '../positionAssignment';
import { extractAttributeValues } from '../../../getters/getAttributeGrouping';

import { organizeDrawPositionOptions } from './organizeDrawPositionOptions';
import { getParticipantGroups } from './analyzeDrawPositions';
import { getUnfilledPositions } from './getUnfilledPositions';
import { getUnplacedParticipantIds } from './getUnplacedParticipantIds';
import { getNextParticipantId } from './getNextParticipantId';

import { chunkArray, generateRange, makeDeepCopy } from '../../../../utilities';

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
  drawPositionsChunks,
  drawPositionPairs,
  policyAttributes,
  drawDefinition,
  pairedPriority,
  structureId,
  allGroups,
}) {
  const errors = [];
  let groupKey, selectedParticipantId;
  let candidatePositionAssignments = makeDeepCopy(initialPositionAssignments);
  const candidateDrawDefinition = makeDeepCopy(drawDefinition);

  generateRange(0, opponentsToPlaceCount).forEach(() => {
    const targetParticipantIds = getUnplacedParticipantIds({
      participantIds: unseededParticipantIds,
      positionAssignments: candidatePositionAssignments,
    });

    const unfilledPositions = getUnfilledPositions({
      drawPositionPairs,
      positionAssignments: candidatePositionAssignments,
    });

    ({ participantId: selectedParticipantId, groupKey } = getNextParticipantId({
      groupKey,
      policyAttributes,
      targetParticipantIds,
      participants: participantsWithContext,
    }));

    const selectedParticipantGroups = getParticipantGroups({
      allGroups,
      participantId: selectedParticipantId,
    });

    const drawPositionOptions = organizeDrawPositionOptions({
      allGroups,
      unfilledPositions,
      drawPositionsChunks,
      positionAssignments: candidatePositionAssignments,
      selectedParticipantGroups,
    });
    const { unassigned, unpaired, pairedNoConflict } = drawPositionOptions;

    // desiredOptions are selected as follows:
    // 1. unpaired positions
    // 2. paired positions which have no conflict

    // the first element of each options array represents the greatest possible round separation

    const desiredOptions =
      (pairedNoConflict?.length && pairedNoConflict[0]) ||
      (unpaired?.length && unpaired[0]);

    const prioritizedOptions =
      desiredOptions &&
      (pairedPriority === false ? desiredOptions.reverse() : desiredOptions);

    let targetDrawPosition;
    if (prioritizedOptions) {
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
      });
      return Object.assign({}, assignment, { values });
    }
  );

  let avoidanceConflicts = 0;
  const pairedParticipants = chunkArray(positionedParticipants, 2);
  pairedParticipants.forEach(matchUpPair => {
    const avoidanceConflict = intersection(
      matchUpPair[0].values,
      matchUpPair[1].values
    ).length;

    if (avoidanceConflict) {
      avoidanceConflicts++;
      matchUpPair.conflict = true;
    }
  });

  return {
    positionAssignments: candidatePositionAssignments,
    conflicts: avoidanceConflicts && pairedParticipants,
    errors,
  };
}
