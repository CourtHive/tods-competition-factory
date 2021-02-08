import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getStructureSeedAssignments } from './getStructureSeedAssignments';
import { generateRange, powerOf2, shuffleArray } from '../../utilities';
import { structureAssignedDrawPositions } from './positionsGetter';
import { findStructure } from './findStructure';

import { CONTAINER, WATERFALL } from '../../constants/drawDefinitionConstants';
import {
  MISSING_SEEDING_POLICY,
  MISSING_SEED_BLOCKS,
  MISSING_STRUCTURE,
} from '../../constants/errorConditionConstants';

export function getValidSeedBlocks({
  structure,
  drawDefinition,
  appliedPolicies,
  allPositions,
}) {
  let waterfallSeeding;
  let firstRoundSeedsCount,
    fedSeedNumberOffset = 0;
  const errors = [];
  let isFeedIn,
    isContainer,
    validSeedBlocks = [];

  if (!structure) return [{ error: MISSING_STRUCTURE }];

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
        .filter((f) => f);
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

  const seedBlocks = appliedPolicies?.seeding?.seedBlocks;

  if (!seedBlocks) errors.push({ error: MISSING_SEEDING_POLICY });
  const baseDrawSize = firstRoundDrawPositions?.length || 0;

  // firstRoundDrawPositions have been popped
  // seedRangeDrawPositionBlocks determines FEED_IN
  const seedRangeDrawPositionBlocks = uniqueDrawPositionsByRound.filter(
    (block) => block.filter((drawPosition) => drawPosition <= seedsCount).length
  );

  const countLimit = allPositions ? positionsCount : seedsCount;
  if (structure.structureType === CONTAINER) {
    isContainer = true;

    ({ validSeedBlocks } = constructContainerBlocks({ structure, seedBlocks }));
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
      seedBlocks,
      baseDrawSize,
      seedCountGoal: firstRoundSeedsCount,
      seedNumberOffset: fedSeedNumberOffset,
      drawPositionOffset: firstRoundDrawPositionOffset,
    });
    blocks.forEach((block) => validSeedBlocks.push(block));
    if (error) errors.push({ seedBlockError: error });
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
    console.log('ERROR:', { seedDrawPositions });
  }

  return {
    error: errors,
    validSeedBlocks,
    waterfallSeeding,
    isFeedIn,
    isContainer,
  };
}

function constructContainerBlocks({ structure, seedBlocks }) {
  const errors = [];
  const containedStructures = structure.structures || [];

  const groupSeedBlocks = containedStructures.map((structure) => {
    const { positionAssignments } = structureAssignedDrawPositions({
      structure,
    });
    const drawPositionOffset =
      Math.min(
        ...positionAssignments.map((assignment) => assignment.drawPosition)
      ) - 1;
    const baseDrawSize = positionAssignments.length;

    let blocks, error;
    if (powerOf2(baseDrawSize)) {
      ({ blocks, error } = constructPower2Blocks({
        seedBlocks,
        baseDrawSize,
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
    if (error) {
      errors.push({ seedBlockError: error });
    }
    return blocks;
  });

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
  const seedBlockProfile = [
    [2],
    [3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15, 16],
  ];
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

  return { validSeedBlocks, errors };
}

function constructPower2Blocks({
  baseDrawSize,
  seedBlocks = {},
  seedCountGoal,
  drawPositionOffset = 0,
  seedNumberOffset = 0,
}) {
  let count = 1;
  const blocks = [];

  // sorted for good measure, shouldn't really be necessary
  const seedBlockKeys = Object.keys(seedBlocks).sort((a, b) => +a - +b);
  if (!seedBlockKeys.length) return { blocks, error: MISSING_SEED_BLOCKS };

  // seedBlocks are expected to be well constructed; keys are the sum of all
  // blocks which have come before + 1;
  // e.g. { 1: [[]], 2: [[]], 3: [[], []], 5: [[], [], [], []] }
  seedBlockKeys.forEach((key) => {
    if (count === +key) {
      const seedBlock = seedBlocks[key];
      // array of possible placement drawPositions
      const drawPositions = getSeedDrawPositions(seedBlock, baseDrawSize).map(
        (drawPosition) => drawPosition + drawPositionOffset
      );

      const seedNumbers = getSeeds(count, drawPositions.length).map(
        (seedNumber) => +seedNumber + seedNumberOffset
      );

      const block = { seedNumbers, drawPositions };
      if (count <= seedCountGoal) {
        blocks.push(block);
      }
      count += drawPositions.length;
    }
  });

  return { blocks };

  function getSeeds(s, n) {
    return Array.from(new Array(n), (val, i) => i + s);
  }
  function getSeedDrawPositions(seedBlock, drawSize) {
    return seedBlock.map((d) => +d[0] + drawSize * d[1]);
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
    [9, 10, 11, 12, 13, 14, 15, 16],
  ];

  seedNumberBlocks.forEach((seedNumbers) => {
    const drawPositions = seedNumbers
      .map(() => blockPositions.reverse().pop())
      .filter((f) => f);
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
    .filter((f) => f);

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
    .filter((f) => f);
  const assignedPositionParticipantIds = positionAssignments
    .map((assignment) => assignment.participantId)
    .filter((f) => f);
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
    .filter((f) => f);

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
