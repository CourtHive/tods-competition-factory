import { getSwapOptions } from './getSwapOptions';
import { getAvoidanceConflicts } from './getAvoidanceConflicts';
import { getParticipantPlacement } from './getParticipantPlacement';
import { getPositionedParticipants } from './getPositionedParticipants';
import {
  chunkArray,
  generateRange,
  makeDeepCopy,
  randomPop,
} from '../../../../utilities';

import { GROUP, PAIR, TEAM } from '../../../../constants/participantTypes';
import { SUCCESS } from '../../../../constants/resultConstants';

/**
 *
 * NOTE: some of these parameters are passed directly through to other functions via ...params
 *
 * @param {object[]} initialPositionAssignments - positionAssignments before any new participants placed
 * @param {object[]} participantsWithContext - participants with added team/group/pair participantIds arrays
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
    participantsWithContext,
    opponentsToPlaceCount,
    drawPositionGroups,
    policyAttributes,
    // entries,
  } = params;

  const errors = [],
    idCollections = {};
  let groupKey;

  const groupSize = Math.min(...drawPositionGroups.map((dpg) => dpg.length));
  const isRoundRobin = groupSize > 2;

  // scope the idCollections to entered participants to reduce processing
  /*
  const enteredParticipantIds =
    entries?.map(({ participantId }) => participantId) || [];
  const enteredParticipantFilter = (participant) =>
    participant.individualParticipantIds?.length &&
    intersection(participant.individualParticipantIds, enteredParticipantIds)
      .length;
  const relevantContextParticipants = participantsWithContext.filter(
    enteredParticipantFilter
  );
  */

  idCollections.groupParticipants = participantsWithContext
    .filter((participant) => participant.participantType === GROUP)
    .map((participant) => participant.participantId);
  idCollections.teamParticipants = participantsWithContext
    .filter((participant) => participant.participantType === TEAM)
    .map((participant) => participant.participantId);
  idCollections.pairParticipants = participantsWithContext
    .filter((participant) => participant.participantType === PAIR)
    .map((participant) => participant.participantId);

  const candidatePositionAssignments = makeDeepCopy(initialPositionAssignments);

  // all drawPositions which are available for placement
  const potentialDrawPositions = initialPositionAssignments
    .filter((assignment) => !assignment.participantId)
    .map((assignment) => assignment.drawPosition);

  generateRange(0, opponentsToPlaceCount).forEach(() => {
    const { newGroupKey, selectedParticipantId, targetDrawPosition } =
      getParticipantPlacement({
        ...params,
        groupKey,
        idCollections,
        candidatePositionAssignments,
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
    participantsWithContext,
    policyAttributes,
    idCollections,
  });

  let groupedParticipants = chunkArray(positionedParticipants, groupSize);
  let avoidanceConflicts = getAvoidanceConflicts({
    isRoundRobin,
    groupedParticipants,
  });

  let attempts = 0;
  while (attempts < 20 && avoidanceConflicts.length) {
    const swapOptions = getSwapOptions({
      isRoundRobin,
      avoidanceConflicts,
      drawPositionGroups,
      positionedParticipants,
      potentialDrawPositions,
    });

    if (swapOptions.length) {
      swapAssignedPositions({
        candidatePositionAssignments,
        swapOptions,
      });

      positionedParticipants = getPositionedParticipants({
        candidatePositionAssignments,
        participantsWithContext,
        policyAttributes,
        idCollections,
      });

      groupedParticipants = chunkArray(positionedParticipants, groupSize);
      avoidanceConflicts = getAvoidanceConflicts({
        isRoundRobin,
        groupedParticipants,
      });
      attempts++;
    } else {
      attempts = 20;
    }
  }

  candidatePositionAssignments.forEach((assignment) => {
    // TODO: Investigate this scenario
    if (assignment.bye && assignment.participantId)
      errors.push({ error: 'Invalid Assignment', assignment });
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
  if (!swapOption) return { error: 'No swap options' };

  const firstPosition = swapOption.drawPosition;
  const secondPosition = randomPop(swapOption.possibleDrawPositions);
  const firstParticipantId = candidatePositionAssignments.find(
    (assignment) => assignment.drawPosition === firstPosition
  ).participantId;
  const secondParticipantId = candidatePositionAssignments.find(
    (assignment) => assignment.drawPosition === secondPosition
  ).participantId;
  candidatePositionAssignments.forEach((assignment) => {
    if (assignment.drawPosition === firstPosition) {
      assignment.participantId = secondParticipantId;
    }
    if (assignment.drawPosition === secondPosition) {
      assignment.participantId = firstParticipantId;
    }
  });
  return SUCCESS;
}
