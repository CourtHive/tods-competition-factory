import { getPositionedParticipants } from './getPositionedParticipants';
import { getParticipantPlacement } from './getParticipantPlacement';
import { getAvoidanceConflicts } from './getAvoidanceConflicts';
import { getSwapOptions } from './getSwapOptions';
import {
  chunkArray,
  generateRange,
  makeDeepCopy,
  randomPop,
} from '../../../../utilities';

// import { GROUP, PAIR, TEAM } from '../../../../constants/participantConstants';
import { INVALID_ASSIGNMENT } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

/**
 *
 * NOTE: some of these parameters are passed directly through to other functions via ...params
 *
 * @param {object[]} initialPositionAssignments - positionAssignments before any new participants placed
 * @param {object[]} participantsWithGroupings - participants with added team/group/pair participantIds arrays
 * @param {string[]} unseededParticipantIds - ids of participants who are unseeded
 * @param {object[]} drawPositionChunks - drawPositions grouped by round starting with the final round
 * @param {object[]} drawPositionGroups - drawPositions paird with their initial round opponent drawPosition
 * @param {object[]} policyAttributes - { key: '' } objects defining accessors for participant values to be compared
 * @param {object} drawDefinition - drawDefinition object
 * @param {boolean} pairedPriority - flag whether to prioritize positions which already have one opponent placed
 * @param {string} structureId - id of the structure in which participants are to be placed
 * @param {object[]} allGroups - map of values and participantIds which have those values
 *
 */
export function generatePositioningCandidate(params) {
  const {
    initialPositionAssignments,
    participantsWithGroupings,
    opponentsToPlaceCount,
    unseededByePositions,
    drawPositionGroups,
    policyAttributes,
    idCollections,
    allGroups,
  } = params;

  const errors = [];
  let groupKey;

  const groupSize = Math.min(
    ...(drawPositionGroups || []).map((dpg) => dpg?.length).filter(Boolean)
  );
  const isRoundRobin = groupSize > 2;

  const candidatePositionAssignments = makeDeepCopy(
    initialPositionAssignments,
    false,
    true
  ).filter((assignment) => !assignment.qualifier);

  // all drawPositions which are available for placement
  const potentialDrawPositions = initialPositionAssignments
    .filter(
      (assignment) =>
        !assignment.participantId &&
        (!assignment.bye ||
          unseededByePositions?.includes(assignment.drawPosition))
    )
    .map((assignment) => assignment.drawPosition);

  generateRange(0, opponentsToPlaceCount).forEach(() => {
    const { newGroupKey, selectedParticipantId, targetDrawPosition } =
      getParticipantPlacement({
        ...params,
        candidatePositionAssignments,
        allGroups,
        groupKey,
      });
    groupKey = newGroupKey;

    candidatePositionAssignments.forEach((assignment) => {
      if (assignment.drawPosition === targetDrawPosition) {
        assignment.participantId = selectedParticipantId;
      }
    });
  });

  let positionedParticipants = getPositionedParticipants({
    candidatePositionAssignments,
    participantsWithGroupings,
    policyAttributes,
    idCollections,
  });

  let groupedParticipants = chunkArray(positionedParticipants, groupSize);
  let avoidanceConflicts = getAvoidanceConflicts({
    groupedParticipants,
    isRoundRobin,
  });

  let attempts = 0;
  while (attempts < 20 && avoidanceConflicts.length) {
    const swapOptions = getSwapOptions({
      positionedParticipants,
      potentialDrawPositions,
      avoidanceConflicts,
      drawPositionGroups,
      isRoundRobin,
    });
    if (swapOptions.length) {
      const result = swapAssignedPositions({
        candidatePositionAssignments,
        swapOptions,
      });
      if (result.error) console.log({ result });

      positionedParticipants = getPositionedParticipants({
        candidatePositionAssignments,
        participantsWithGroupings,
        policyAttributes,
        idCollections,
      });

      groupedParticipants = chunkArray(positionedParticipants, groupSize);
      avoidanceConflicts = getAvoidanceConflicts({
        groupedParticipants,
        isRoundRobin,
      });
      attempts++;
    } else {
      attempts = 20;
    }
  }

  candidatePositionAssignments.forEach((assignment) => {
    // TODO: Investigate this scenario
    if (assignment.bye && assignment.participantId) {
      const error = INVALID_ASSIGNMENT;
      errors.push(error);
    }
    if (assignment.qualifier && assignment.participantId) {
      const error = INVALID_ASSIGNMENT;
      errors.push(error);
    }
  });

  return {
    positionAssignments: candidatePositionAssignments,
    conflicts: avoidanceConflicts.length,
    groupedParticipants,
    errors,
  };
}

export function swapAssignedPositions({
  candidatePositionAssignments,
  swapOptions,
}) {
  const swapOption = randomPop(swapOptions);
  if (!swapOption) return { error: { message: 'No swap options' } };

  const firstPosition = swapOption.drawPosition;
  const secondPosition = randomPop(swapOption.possibleDrawPositions);
  const firstAssignment = candidatePositionAssignments.find(
    (assignment) => assignment.drawPosition === firstPosition
  );
  const secondAssignment = candidatePositionAssignments.find(
    (assignment) => assignment.drawPosition === secondPosition
  );

  const updatedFirstAssignmentAttributes = {
    participantId: secondAssignment.participantId,
    qualifier: secondAssignment.qualifier,
    bye: secondAssignment.bye,
  };
  const updatedSecondAssignmentAttributes = {
    participantId: firstAssignment.participantId,
    qualifier: firstAssignment.qualifier,
    bye: firstAssignment.bye,
  };

  Object.assign(firstAssignment, updatedFirstAssignmentAttributes);
  Object.assign(secondAssignment, updatedSecondAssignmentAttributes);

  return { ...SUCCESS };
}
