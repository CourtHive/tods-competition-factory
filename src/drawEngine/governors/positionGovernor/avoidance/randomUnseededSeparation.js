import { assignDrawPosition } from '../positionAssignment';
import { findStructure } from '../../../getters/findStructure';
import { getAllStructureMatchUps } from '../../../getters/getMatchUps';
import { getAttributeGroupings } from '../../../getters/getAttributeGrouping';
import { structureAssignedDrawPositions } from '../../../getters/positionsGetter';

import {
  chunkArray,
  generateRange,
  makeDeepCopy,
  nearestPowerOf2,
  numericSort,
  randomMember,
} from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import { intersection } from '../../../../utilities/arrays';

/**
 *
 * @param {object} avoidance - an avoidance policy
 * @param {string} structureId - id of the structure within a drawDefinition in which participantIds will be assigned drawPositions
 * @param {object[]} participants - all tournament participants; used to access attribute values for grouping
 * @param {object} drawDefinition - object containing the definition of a draw including all entries, structures and links
 * @param {string[]} unseededParticipantIds - participantIds which are to be assigned drawPositions
 *
 */
export function randomUnseededSeparation({
  avoidance,
  structureId,
  participants,
  drawDefinition,
  unseededParticipantIds,
}) {
  const policyAttributes = avoidance?.policyAttributes;
  const { structure } = findStructure({ drawDefinition, structureId });
  const { matchUps } = getAllStructureMatchUps({ structure });
  const {
    positionAssignments: initialPositionAssignments,
  } = structureAssignedDrawPositions({ structure });
  const unassignedPositions = initialPositionAssignments.filter(
    assignment => !assignment.participantId
  );

  const allDrawPositions = initialPositionAssignments.map(
    assignment => assignment.drawPosition
  );
  const drawPositionPairs = matchUps
    .filter(matchUp => matchUp.roundNumber === 1)
    .map(matchUp => matchUp.drawPositions);
  const firstRoundMatchUpDrawPositions = drawPositionPairs
    .flat()
    .sort(numericSort);
  const greatestFirstRoundDrawPosition = Math.max(
    ...firstRoundMatchUpDrawPositions
  );
  const fedDrawPositions = allDrawPositions.filter(
    drawPositon => drawPositon > greatestFirstRoundDrawPosition
  );

  // TODO: calculate chunking for fed drawPositions
  if (fedDrawPositions.length) console.log({ fedDrawPositions });

  const structureSize = firstRoundMatchUpDrawPositions.length;
  const chunkSizes = generateRange(2, structureSize)
    .filter(f => f === nearestPowerOf2(f))
    .reverse();
  const drawPositionsChunks = chunkSizes.map(size =>
    chunkArray(firstRoundMatchUpDrawPositions, size)
  );

  const allGroups = getAttributeGroupings({
    participants,
    policyAttributes,
    targetParticipantIds: unseededParticipantIds,
  });

  const unplacedParticipantIds = getUnplacedParticipantIds({
    participantIds: unseededParticipantIds,
    positionAssignments: initialPositionAssignments,
  });

  if (unplacedParticipantIds.length > unassignedPositions.length) {
    return { error: 'More participantIds than unpaired positions' };
  }

  const errors = [];
  const opponentsToPlaceCount = unplacedParticipantIds.length;

  let groupKey, selectedParticipantId;
  let positionAssignments = makeDeepCopy(initialPositionAssignments);

  generateRange(0, opponentsToPlaceCount).forEach(() => {
    const targetParticipantIds = getUnplacedParticipantIds({
      participantIds: unseededParticipantIds,
      positionAssignments,
    });

    const unfilledPositions = getUnfilledPositions({
      drawPositionPairs,
      positionAssignments,
    });

    ({ participantId: selectedParticipantId, groupKey } = getNextParticipantId({
      groupKey,
      participants,
      policyAttributes,
      targetParticipantIds,
    }));

    const selectedParticipantGroups = getParticipantGroups({
      allGroups,
      participantId: selectedParticipantId,
    });

    const vettedChunks = drawPositionsChunks.map(chunkedDrawPositions =>
      checkDrawPositionsChunk({
        allGroups,
        unfilledPositions,
        positionAssignments,
        chunkedDrawPositions,
        groupsToAvoid: selectedParticipantGroups,
      })
    );
    const targetDrawPosition = randomMember(unfilledPositions);
    console.log(vettedChunks);

    const result = assignDrawPosition({
      drawDefinition,
      structureId,
      participantId: selectedParticipantId,
      drawPosition: targetDrawPosition,
    });
    if (result.success) {
      positionAssignments = result.positionAssignments;
    } else {
      errors.push(result.error);
    }
  });

  return errors.length
    ? { error: errors }
    : Object.assign({ positionAssignments }, SUCCESS);
}

function getParticipantGroups({ allGroups, participantId }) {
  return Object.keys(allGroups).filter(key =>
    allGroups[key].includes(participantId)
  );
}

/**
 *
 * @param {string[]} allGroups - group names derived from participant attributes which match policyAttributes
 * @param {string[]} groupsToAvoid - names of groups which contain the participantId currently being placed
 * @param {number[]} unfilledPositions - drawPositions which have not been assigned a participantid
 * @param {object[]} positionAssignments - array of assignment objects
 * @param {object[]} chunkedDrawPositions - array of arrays of drawPositions
 */
function checkDrawPositionsChunk({
  allGroups,
  groupsToAvoid,
  unfilledPositions,
  positionAssignments,
  chunkedDrawPositions,
}) {
  const profiledPositions = Object.assign(
    {},
    ...positionAssignments
      .filter(assignment => assignment?.participantId)
      .map(assginment => {
        const { drawPosition, participantId } = assginment;
        const participantGroups = getParticipantGroups({
          allGroups,
          participantId,
        });
        const includesGroupsToAvoid = !!intersection(
          groupsToAvoid,
          participantGroups
        ).length;
        return { [drawPosition]: { participantGroups, includesGroupsToAvoid } };
      })
  );

  const checkedChunk = chunkedDrawPositions.map(chunkedGrouping => {
    const unassigned = unfilledPositions.filter(unfilledPosition =>
      chunkedGrouping.includes(unfilledPosition)
    );
    const unpaired = unpairedPositions(unassigned);
    const paired = unassigned.filter(
      drawPosition => !unpaired.includes(drawPosition)
    );
    const pairedNoConflict = paired.filter(drawPosition => {
      const pairedPosition = getPairedPosition(drawPosition);
      return !profiledPositions[pairedPosition].includesGroupsToAvoid;
    });
    return { unassigned, unpaired, pairedNoConflict };
  });
  return checkedChunk;

  function unpairedPositions(unassigned) {
    return unassigned.filter(u => !pairAssigned(u));

    function pairAssigned(drawPosition) {
      const pairedPosition = getPairedPosition(drawPosition);
      return !unassigned.includes(pairedPosition);
    }
  }
}

/**
 *
 * @param {string} drawPosition
 *
 * Returns paired position for first round matches in elimination structures
 */
function getPairedPosition(drawPosition) {
  return drawPosition % 2 ? drawPosition + 1 : drawPosition - 1;
}

/**
 *
 * @param {object[]} participants - all tournament participants; used to access attribute values for grouping
 * @param {string[]} policyAtributtes - participant attributes to be processed to create groupings
 * @param {string[]} targetParticipantIds - participantIds to be processed
 * @param {string} groupKey - OPTIONAL - specify default grouping
 *
 * @param {boolean} useSpecifiedGroupKey - defaults to true; use specified group key, if present
 * @param {boolean} largestFirst - defaults to true; return participantId from groupings with largest number of participantIds
 *
 * Creates groupings of participantIds based on policyAttributes
 * Returns a participantId at random from either the specified group, the largest group, or a randomly selected group
 */
function getNextParticipantId({
  participants,
  policyAttributes,
  targetParticipantIds,

  groupKey,
  largestFirst = true,
  useSpecifiedGroupKey = true,
}) {
  const targetGroups = getAttributeGroupings({
    participants,
    policyAttributes,
    targetParticipantIds,
  });
  const largestGroupSize = Object.keys(targetGroups).reduce(
    (size, key) =>
      targetGroups[key].length > size ? targetGroups[key].length : size,
    0
  );
  const largestSizedGroupings = Object.keys(targetGroups).filter(
    key => targetGroups[key].length === largestGroupSize
  );

  const randomGroupKey = largestFirst
    ? randomMember(largestSizedGroupings)
    : randomMember(Object.keys(targetGroups));

  groupKey =
    useSpecifiedGroupKey && targetGroups[groupKey]?.length
      ? groupKey
      : randomGroupKey;

  const participantId = randomMember(targetGroups[groupKey]);
  return { participantId, groupKey };
}

/**
 *
 * @param {string[]} participantIds
 * @param {string[]} positionAssignments - assignment objects which associate drawPositions with participantIds
 *
 * Returns an array of participantsIds which have not been assigned
 */
function getUnplacedParticipantIds({ participantIds, positionAssignments }) {
  const assignedParticipantIds = positionAssignments.map(
    assignment => assignment.participantId
  );
  return participantIds.filter(
    participantId => !assignedParticipantIds.includes(participantId)
  );
}

/**
 *
 * @param {object[]} matchUps
 * @param {object[]} positionAssignments - assignment objects which associate drawPositions with participantIds
 *
 * Returns an array of drawPositions which have not been filled
 */
function getUnfilledPositions({ drawPositionPairs, positionAssignments }) {
  const assignmentMap = Object.assign(
    {},
    ...positionAssignments.map(assignment => ({
      [assignment.drawPosition]: assignment,
    }))
  );

  const unpairedPositions = drawPositionPairs
    .map(drawPositions => {
      const unpaired = drawPositions
        .filter(f => f)
        .map(drawPosition => assignmentMap[drawPosition])
        .filter(assignment => !assignment.participantId)
        .map(assignment => assignment.drawPosition);
      return unpaired;
    })
    .flat()
    .filter(f => f);

  return unpairedPositions;
}
