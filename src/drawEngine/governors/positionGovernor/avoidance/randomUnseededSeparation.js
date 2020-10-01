import { findStructure } from '../../../getters/findStructure';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps';
import { getAttributeGroupings } from '../../../getters/getAttributeGrouping';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';

import { SUCCESS } from '../../../../constants/resultConstants';

export function randomUnseededSeparation({
  avoidance,
  structureId,
  participants,
  drawDefinition,
  unseededParticipantIds,
}) {
  // 1. group unseededParticipantIds by the avoidance attribute
  const policyAttributes = avoidance?.policyAttributes;
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({ structure });
  const matchUpDrawPositions = matchUps.map(matchUp => matchUp.drawPositions);
  const { positionAssignments } = structureAssignedDrawPositions({ structure });

  const unpairedPositions = getUnpairedPositions({
    matchUpDrawPositions,
    positionAssignments,
  });
  const unplacedParticipantIds = getUnplacedParticipantIds({
    participantIds: unseededParticipantIds,
    positionAssignments,
  });

  const nextOpponent = getNextOpponent({
    participants,
    policyAttributes,
    targetParticipantIds: unplacedParticipantIds,
  });
  console.log({
    nextOpponent,
    unpairedPositions,
    unplacedParticipantIds,
  });

  return SUCCESS;
}

function getNextOpponent({
  participants,
  policyAttributes,
  targetParticipantIds,
}) {
  const groupings = getAttributeGroupings({
    participants,
    policyAttributes,
    targetParticipantIds,
  });
  const largestGroup = Object.keys(groupings).reduce(
    (size, key) =>
      groupings[key].length > size ? groupings[key].length : size,
    0
  );
  const smallestGroup = Object.keys(groupings).reduce(
    (size, key) =>
      groupings[key].length < size ? groupings[key].length : size,
    largestGroup
  );
  console.log({ groupings, largestGroup, smallestGroup });
}

function getUnplacedParticipantIds({ participantIds, positionAssignments }) {
  const assignedParticipantIds = positionAssignments.map(
    assignment => assignment.participantId
  );
  return participantIds.filter(
    participantId => !assignedParticipantIds.includes(participantId)
  );
}

function getUnpairedPositions({ matchUpDrawPositions, positionAssignments }) {
  const assignmentMap = Object.assign(
    {},
    ...positionAssignments.map(assignment => ({
      [assignment.drawPosition]: assignment,
    }))
  );

  const unpairedPositions = matchUpDrawPositions.filter(drawPositions => {
    const unpaired = drawPositions
      .filter(f => f)
      .map(drawPosition => assignmentMap[drawPosition])
      .filter(assignment => !assignment.participantId)
      .map(assignment => assignment.drawPosition);
    return unpaired.length;
  });

  return unpairedPositions;
}
