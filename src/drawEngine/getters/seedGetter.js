import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getSeedBlocks } from '../governors/positionGovernor/getSeedBlocks';
import { getStructureSeedAssignments } from './getStructureSeedAssignments';
import { generateRange, isPowerOf2, shuffleArray } from '../../utilities';
import { structureAssignedDrawPositions } from './positionsGetter';
import { findStructure } from './findStructure';

import {
  CLUSTER,
  CONTAINER,
  WATERFALL,
} from '../../constants/drawDefinitionConstants';
import {
  INVALID_SEED_POSITION,
  MISSING_STRUCTURE,
} from '../../constants/errorConditionConstants';

export function getValidSeedBlocks({
  structure,
  drawDefinition,
  appliedPolicies,
  allPositions,
}) {
  let firstRoundSeedsCount,
    fedSeedNumberOffset = 0;
  let error,
    isFeedIn,
    isContainer,
    validSeedBlocks = [];

  if (!structure) return { error: MISSING_STRUCTURE };

  const { roundMatchUps } = getAllStructureMatchUps({
    structure,
    roundFilter: 1,
  });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const positionsCount = positionAssignments.length;
  const seedsCount = seedAssignments?.length || 0;

  let allDrawPositions = [];
  const roundNumbers = Object.keys(roundMatchUps).sort((a, b) => a - b);
  const uniqueDrawPositionsByRound = roundNumbers
    .map((roundNumber) => {
      const roundDrawPositions = roundMatchUps[roundNumber]
        .map((matchUp) => matchUp.drawPositions)
        .flat(Infinity)
        .filter(Boolean);
      const uniqueRoundDrawPositions = roundDrawPositions.filter(
        (drawPosition) => !allDrawPositions.includes(drawPosition)
      );
      allDrawPositions = allDrawPositions.concat(...roundDrawPositions);
      return uniqueRoundDrawPositions;
    })
    .filter((f) => f.length)
    .reverse();

  const firstRoundDrawPositions = uniqueDrawPositionsByRound.pop();
  const firstRoundDrawPositionOffset =
    (firstRoundDrawPositions && Math.min(...firstRoundDrawPositions) - 1) || 0;

  const seedingProfile = appliedPolicies?.seeding?.seedingProfile;
  const baseDrawSize = firstRoundDrawPositions?.length || 0;

  // firstRoundDrawPositions have been popped
  // seedRangeDrawPositionBlocks determines FEED_IN
  const seedRangeDrawPositionBlocks = uniqueDrawPositionsByRound.filter(
    (block) => block.filter((drawPosition) => drawPosition <= seedsCount).length
  );

  const countLimit = allPositions ? positionsCount : seedsCount;
  if (structure.structureType === CONTAINER) {
    isContainer = true;

    ({ validSeedBlocks, error } = constructContainerBlocks({
      seedingProfile,
      structure,
    }));
    if (error) return { error };
  } else if (uniqueDrawPositionsByRound.length) {
    isFeedIn = true;

    // for FEED_IN structures, block seeding proceeds from final rounds
    // to earlier rounds.  If there are more seeds than fed positions,
    // then seeds must be assigned to first round drawPositions
    validSeedBlocks = seedRangeDrawPositionBlocks.map((block) => {
      return { seedNumbers: block, drawPositions: block };
    });
    const fedSeedBlockPositions = seedRangeDrawPositionBlocks.flat(Infinity);

    // firstRoundSeedsCount determines how many seeds must be placed in first round
    firstRoundSeedsCount =
      fedSeedBlockPositions.length < countLimit
        ? countLimit - fedSeedBlockPositions.length
        : 0;

    // fedSeedNumberOffset is used to calculate seedNumber
    // should be equal fo firstRoundDrawPositionOffset
    fedSeedNumberOffset = fedSeedBlockPositions.length;
  } else {
    firstRoundSeedsCount = countLimit;
  }

  if (!isContainer) {
    const { blocks, error } = constructPower2Blocks({
      baseDrawSize,
      seedingProfile,
      seedCountGoal: firstRoundSeedsCount,
      seedNumberOffset: fedSeedNumberOffset,
      drawPositionOffset: firstRoundDrawPositionOffset,
    });
    if (error) {
      return {
        error,
        validSeedBlocks: [],
        isContainer,
        isFeedIn,
      };
    }
    blocks.forEach((block) => validSeedBlocks.push(block));
  }

  const seedDrawPositions = [].concat(
    ...validSeedBlocks.map((seedBlock) => seedBlock.drawPositions)
  );
  const validSeedPositions = seedDrawPositions.reduce(
    (result, drawPosition) => {
      return firstRoundDrawPositions?.includes(drawPosition) && result;
    },
    true
  );

  if (!isFeedIn && !isContainer && !validSeedPositions) {
    return {
      error: INVALID_SEED_POSITION,
      validSeedBlocks: [],
      isContainer,
      isFeedIn,
    };
  }

  return {
    validSeedBlocks,
    isFeedIn,
    isContainer,
  };
}

function constructContainerBlocks({ seedingProfile, structure, seedBlocks }) {
  const containedStructures = structure.structures || [];

  const groupSeedBlocks = [];
  for (const structure of containedStructures) {
    const { positionAssignments } = structureAssignedDrawPositions({
      structure,
    });
    const drawPositionOffset =
      Math.min(
        ...positionAssignments.map((assignment) => assignment.drawPosition)
      ) - 1;
    const baseDrawSize = positionAssignments.length;

    let blocks, error;
    if (isPowerOf2(baseDrawSize)) {
      ({ blocks, error } = constructPower2Blocks({
        seedBlocks,
        baseDrawSize,
        seedingProfile,
        drawPositionOffset,
        seedCountGoal: baseDrawSize,
      }));
    } else {
      ({ blocks, error } = constructBlocks({
        baseDrawSize,
        drawPositionOffset,
        seedCountGoal: baseDrawSize,
      }));
    }
    if (error) return { error };
    groupSeedBlocks.push(blocks);
  }

  const seedNumberDrawPositions = groupSeedBlocks
    .map((groupBlocks) => {
      return groupBlocks.map((block) => {
        return block.seedNumbers.map((seedNumber, i) => ({
          seedNumber,
          drawPosition: block.drawPositions[i],
        }));
      });
    })
    .flat(Infinity)
    .sort((a, b) => a.seedNumber - b.seedNumber);
  const drawPositionsGroups = seedNumberDrawPositions.reduce(
    (groups, candidate) => {
      const seedNumber = candidate.seedNumber;
      if (!groups[seedNumber]) groups[seedNumber] = [];
      groups[seedNumber].push(candidate.drawPosition);
      return groups;
    },
    {}
  );

  let seedCounter = 1,
    validSeedBlocks = [];
  if (drawPositionsGroups[1]) {
    drawPositionsGroups[1].forEach((drawPosition, i) => {
      validSeedBlocks.push({
        seedNumbers: [i + 1],
        drawPositions: [drawPosition],
      });
      seedCounter++;
    });
  }
  const seedBlockProfile = [[2], [3, 4], [5, 6, 7, 8], generateRange(9, 17)];
  seedBlockProfile.forEach((profile) => {
    const drawPositions = [].concat(
      ...profile.map((key) => drawPositionsGroups[key] || [])
    );
    const seedNumbers = drawPositions.map((_, i) => seedCounter + i);
    const seedBlock = { seedNumbers, drawPositions };
    validSeedBlocks.push(seedBlock);
    seedCounter += seedNumbers.length;
  });

  const topDown = (a, b) => a - b;
  const bottomUp = (a, b) => b - a;
  const waterfallSeeding = Object.keys(drawPositionsGroups)
    .map((key, i) => drawPositionsGroups[key].sort(i % 2 ? bottomUp : topDown))
    .flat()
    .map((drawPosition, i) => ({
      seedNumbers: [i + 1],
      drawPositions: [drawPosition],
    }));

  if (structure.seedingProfile === WATERFALL)
    validSeedBlocks = waterfallSeeding;

  return { validSeedBlocks };
}

function constructPower2Blocks({
  baseDrawSize,
  seedCountGoal,
  seedingProfile,
  drawPositionOffset = 0,
  seedNumberOffset = 0,
}) {
  let count = 1;
  const blocks = [];

  const { seedBlocks } = getSeedBlocks({
    participantsCount: baseDrawSize,
    cluster: seedingProfile === CLUSTER,
  });

  count = 0;
  for (const seedBlock of seedBlocks) {
    if (count + 1 > seedCountGoal) break;
    const drawPositions = seedBlock.map(
      (drawPosition) => drawPosition + drawPositionOffset
    );
    const seedNumbers = getSeeds(count + 1, seedBlock.length).map(
      (seedNumber) => +seedNumber + seedNumberOffset
    );
    count += seedBlock.length;
    blocks.push({ drawPositions, seedNumbers });
  }

  return { blocks };

  function getSeeds(s, n) {
    return Array.from(new Array(n), (val, i) => i + s);
  }
}

function constructBlocks({
  baseDrawSize,
  seedCountGoal,
  drawPositionOffset = 0,
}) {
  let count = 1;
  const blocks = [];
  const blockPositions = generateRange(
    drawPositionOffset + 1,
    drawPositionOffset + baseDrawSize + 1
  );
  const seedNumberBlocks = [
    [1],
    [2],
    [3, 4],
    [5, 6, 7, 8],
    generateRange(9, 17),
    generateRange(17, 33),
    generateRange(33, 65),
  ];

  seedNumberBlocks.forEach((seedNumbers) => {
    const drawPositions = seedNumbers
      .map(() => blockPositions.reverse().pop())
      .filter(Boolean);
    seedNumbers = seedNumbers.slice(0, drawPositions.length);

    const block = { seedNumbers, drawPositions };
    if (count <= seedCountGoal) {
      blocks.push(block);
    }
    count += drawPositions.length;
  });

  return { blocks };
}

/**
 *
 * @param {Object} drawDefinition - TODS JSON Object containing draw components
 * @param {string} structureId - identifier for relevant structure within drawDefinition
 * @param {number} drawPosition - position being checked for valid seed placement
 * @param {number} seedNumber - used with srict seeding policy to determine valid seedBlock
 *
 * method operates in three modes:
 * 1. Lenient (default) - any valid seed number can go in any valid seed position
 * 2. Ignore - method is bypassed and always returns true
 * 3. Strict - drawPosition is only valid if it is found in seedBlock which contains seedNumber
 *
 */
export function isValidSeedPosition({
  seedNumber,
  drawDefinition,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { validSeedBlocks } = getValidSeedBlocks({
    structure,
    drawDefinition,
    appliedPolicies,
  });

  if (appliedPolicies?.seeding?.validSeedPositions?.ignore) return true;
  if (appliedPolicies?.seeding?.validSeedPositions?.strict) {
    const targetSeedBlock = validSeedBlocks.find((seedBlock) =>
      seedBlock.seedNumbers.includes(seedNumber)
    );
    const validSeedPositions = targetSeedBlock?.drawPositions || [];
    return validSeedPositions.includes(drawPosition);
  }

  const validSeedPositions = [].concat(
    ...validSeedBlocks.map((seedBlock) => seedBlock.drawPositions)
  );
  return validSeedPositions.includes(drawPosition);
}

export function getNextSeedBlock({ drawDefinition, structureId, randomize }) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const positionsWithParticipants = positionAssignments.filter(
    (assignment) =>
      assignment.participantId || assignment.bye || assignment.qualifier
  );
  const assignedDrawPositions = positionsWithParticipants
    .map((assignment) => assignment.drawPosition)
    .filter(Boolean);

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { validSeedBlocks } = getValidSeedBlocks({
    structure,
    drawDefinition,
    appliedPolicies,
  });
  const unfilledSeedBlocks = (validSeedBlocks || []).filter((seedBlock) => {
    const unfilledPositions = seedBlock.drawPositions.filter(
      (drawPosition) => !assignedDrawPositions.includes(drawPosition)
    );
    return unfilledPositions.length;
  });
  const nextSeedBlock = unfilledSeedBlocks[0];

  const assignedSeedParticipantIds = seedAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);
  const assignedPositionParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter(Boolean);
  const placedSeedParticipantIds = assignedSeedParticipantIds.filter(
    (participantId) => assignedPositionParticipantIds.includes(participantId)
  );

  const unplacedSeedIds = assignedSeedParticipantIds.filter(
    (participantId) => !assignedPositionParticipantIds.includes(participantId)
  );

  const unplacedSeedAssignments = seedAssignments.filter((assignment) =>
    unplacedSeedIds.includes(assignment.participantId)
  );

  const seedsWithoutDrawPositions = seedAssignments.filter(
    (assignment) => !assignment.participantId
  );
  const seedsLeftToAssign =
    unplacedSeedAssignments.length || seedsWithoutDrawPositions.length;
  const unfilled =
    (seedsLeftToAssign &&
      nextSeedBlock?.drawPositions.filter(
        (drawPosition) => !assignedDrawPositions.includes(drawPosition)
      )) ||
    [];
  const unfilledPositions = randomize ? shuffleArray(unfilled) : unfilled;

  const selectedParticipantIds = [];
  const randomlySelectedUnplacedSeedValueIds = unfilledPositions
    .map(() => {
      const assignment = randomlySelectLowestSeedValue(
        unplacedSeedAssignments,
        selectedParticipantIds
      );
      const participantId = assignment && assignment.participantId;
      if (participantId) selectedParticipantIds.push(participantId);
      return participantId;
    })
    .filter(Boolean);

  const placedSeedNumbers = seedAssignments
    .filter((assignment) =>
      placedSeedParticipantIds.includes(assignment.participantId)
    )
    .map((assignment) => assignment.seedNumber);
  const blockSeedNumbers = (nextSeedBlock && nextSeedBlock.seedNumbers) || [];

  // unplacedSeedNumbers and unplacedSeedNumberIds will only be used
  // when policy specifies that seedNumbers/seedValues must be unique
  const unplacedSeedNumbers = blockSeedNumbers.filter(
    (seedNumber) => !placedSeedNumbers.includes(seedNumber)
  );

  const unplacedSeedNumberIds = seedAssignments
    .filter((assignment) => unplacedSeedNumbers.includes(assignment.seedNumber))
    .map((assignment) => assignment.participantId);

  const duplicateSeedNumbers = appliedPolicies?.seeding?.duplicateSeedNumbers;
  const allowsDuplicateSeedNumbers =
    duplicateSeedNumbers !== undefined ? duplicateSeedNumbers : true;

  const unplacedSeedParticipantIds = allowsDuplicateSeedNumbers
    ? randomlySelectedUnplacedSeedValueIds
    : unplacedSeedNumberIds;

  return {
    nextSeedBlock,
    unplacedSeedParticipantIds,
    unplacedSeedNumbers,
    unfilledPositions,
    unplacedSeedAssignments,
  };

  function randomlySelectLowestSeedValue(assignments, selectedParticipantIds) {
    const filteredAssignments = assignments.filter(
      (assignment) => !selectedParticipantIds.includes(assignment.participantId)
    );
    const lowestSeedValue = Math.min(
      ...filteredAssignments.map((assignment) => assignment.seedValue)
    );
    const assignmentsWithLowestSeedValue = filteredAssignments.filter(
      (assignment) => assignment.seedValue === lowestSeedValue
    );
    const randomizedAssignments = shuffleArray(assignmentsWithLowestSeedValue);
    return randomizedAssignments.pop();
  }
}
