import { getAppliedPolicies } from '../../global/functions/deducers/getAppliedPolicies';
import { getAllStructureMatchUps } from './getMatchUps/getAllStructureMatchUps';
import { getStructureSeedAssignments } from './getStructureSeedAssignments';
import { getNumericSeedValue } from './getNumericSeedValue';
import { findStructure } from './findStructure';
import {
  getSeedBlocks,
  getSeedGroups,
} from '../governors/positionGovernor/getSeedBlocks';
import {
  getPositionAssignments,
  structureAssignedDrawPositions,
} from './positionsGetter';
import {
  chunkArray,
  generateRange,
  isPowerOf2,
  shuffleArray,
} from '../../utilities';

import {
  CLUSTER,
  CONTAINER,
  QUALIFYING,
  WATERFALL,
} from '../../constants/drawDefinitionConstants';
import {
  INVALID_SEED_POSITION,
  MISSING_STRUCTURE,
} from '../../constants/errorConditionConstants';

/**
 * A seedBlock is an object pairing an array of drawPositions with an array of seedNumbers { drawPositions: [], seedNumbers: []}
 * In an elimination structure The first seedBlock is { drawPositions: [1], seedNumbers: [1] }
 * In an elimination structure The second seedBlock is{ drawPositions: [drawSize], seedNumbers: [2] }
 * In an elimination structure the third seedBlock is { drawPositions: [a, b], seedNumbers: [3, 4] }
 * In an elimination structure the fourth seedBlock is { drawPositions: [w, x, y, z], seedNumbers: [5, 6, 7, 8] }
 * The calculations for the positioning of [a, b] and [w, x, y, z] are specific to seeding policies
 */

export function getValidSeedBlocks({
  provisionalPositioning,
  appliedPolicies,
  drawDefinition,
  allPositions,
  structure,
  event,
}) {
  let validSeedBlocks = [];

  if (!structure) return { error: MISSING_STRUCTURE };

  const { roundMatchUps } = getAllStructureMatchUps({
    matchUpFilters: { roundNumbers: [1] },
    provisionalPositioning,
    structure,
  });
  const { seedAssignments } = getStructureSeedAssignments({
    provisionalPositioning,
    drawDefinition,
    structure,
    event,
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

  const { stage, structureType, roundLimit } = structure;
  const isContainer = structureType === CONTAINER;
  const isFeedIn = !isContainer && uniqueDrawPositionsByRound?.length;
  // if there are first round draw positions it is not AdHoc
  // if the baseDrawSize is not a power of 2 then it isLucky
  const isLucky = firstRoundDrawPositions?.length && !isPowerOf2(baseDrawSize);
  const qualifyingBlocks = !isContainer && stage === QUALIFYING && roundLimit;

  const fedSeedBlockPositions = seedRangeDrawPositionBlocks.flat(Infinity);
  const fedSeedNumberOffset = isFeedIn ? fedSeedBlockPositions?.length : 0;
  const countLimit = allPositions ? positionsCount : seedsCount;
  const firstRoundSeedsCount =
    (isLucky && 0) ||
    (!isFeedIn && countLimit) ||
    (fedSeedBlockPositions.length < countLimit &&
      countLimit - fedSeedBlockPositions.length) ||
    0;

  if (qualifyingBlocks) {
    const seedingBlocksCount = structure.matchUps.filter(
      ({ roundNumber }) => roundNumber === structure.roundLimit
    ).length;
    const chunkSize = firstRoundDrawPositions.length / seedingBlocksCount;

    if (isFeedIn) {
      // TODO: figure this out
    } else {
      const positioning = getSeedPattern(seedingProfile);
      const drawPositionChunks = chunkArray(firstRoundDrawPositions, chunkSize);
      let groupNumber = 1;
      const seedGroups = generateRange(0, drawPositionChunks[0].length).map(
        () => {
          const seedNumbers = generateRange(
            groupNumber,
            groupNumber + drawPositionChunks.length
          );
          groupNumber += drawPositionChunks.length;
          return seedNumbers;
        }
      );

      ({ validSeedBlocks } = getSeedBlockPattern({
        drawPositionBlocks: drawPositionChunks,
        positioning,
        seedGroups,
      }));
    }
  } else if (isContainer) {
    const result = getContainerBlocks({
      seedingProfile,
      structure,
    });
    if (!result || result.error) {
      console.log(result);
      return result;
    }
    ({ validSeedBlocks } = result);
  } else if (isFeedIn) {
    // for FEED_IN structures, block seeding proceeds from final rounds
    // to earlier rounds.  If there are more seeds than fed positions,
    // then seeds must be assigned to first round drawPositions
    validSeedBlocks = seedRangeDrawPositionBlocks.map((block) => {
      return { seedNumbers: block, drawPositions: block };
    });
  } else if (isLucky) {
    // if there are first round draw positions it is not AdHoc
    // if the baseDrawSize is not a power of 2 then it isLucky
    // firstRoundSeedsCount = 0;
    const blocks = chunkArray(firstRoundDrawPositions, 2).map((block, i) => ({
      drawPositions: [block[0]],
      seedNumbers: [i + 1],
    }));
    blocks.forEach((block) => validSeedBlocks.push(block));
  }

  if (!isContainer && !isLucky && !qualifyingBlocks) {
    const { blocks, error } = constructPower2Blocks({
      drawPositionOffset: firstRoundDrawPositionOffset,
      seedNumberOffset: fedSeedNumberOffset,
      seedCountGoal: firstRoundSeedsCount,
      seedingProfile,
      baseDrawSize,
    });
    if (error) {
      return {
        validSeedBlocks: [],
        isContainer,
        isFeedIn,
        error,
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

  if (!isLucky && !isFeedIn && !isContainer && !validSeedPositions) {
    return {
      error: INVALID_SEED_POSITION,
      validSeedBlocks: [],
      isContainer,
      isFeedIn,
    };
  }

  return {
    validSeedBlocks,
    isContainer,
    isFeedIn,
    isLucky,
  };
}

export function getContainerBlocks({ seedingProfile, structure }) {
  const containedStructures = structure.structures || [];
  const roundRobinGroupsCount = containedStructures.length;
  const positionAssignments = getPositionAssignments({
    structure,
  })?.positionAssignments;
  const positioning = getSeedPattern(seedingProfile);

  const { seedGroups } = getSeedGroups({
    drawSize: positionAssignments.length,
    roundRobinGroupsCount,
  });
  const drawPositionBlocks = containedStructures.map((containedStructure) =>
    getPositionAssignments({
      structure: containedStructure,
    }).positionAssignments.map((assignment) => assignment.drawPosition)
  );

  return getSeedBlockPattern({
    drawPositionBlocks,
    positioning,
    seedGroups,
  });
}

function getSeedBlockPattern({ positioning, seedGroups, drawPositionBlocks }) {
  const validSeedBlocks = [];

  const topDown = (a, b) => a - b;
  const bottomUp = (a, b) => b - a;
  const assignedPositions = [];
  seedGroups.forEach((seedGroup, i) => {
    if (i && positioning !== WATERFALL) {
      shuffleArray(seedGroup);
    }
    seedGroup.forEach((seedNumber, j) => {
      const blockIndex = i % 2 ? drawPositionBlocks.length - j - 1 : j;
      const drawPosition = drawPositionBlocks[blockIndex]
        .sort(i % 2 ? bottomUp : topDown)
        .find((drawPosition) => !assignedPositions.includes(drawPosition));
      assignedPositions.push(drawPosition);
      validSeedBlocks.push({
        seedNumbers: [seedNumber],
        drawPositions: [drawPosition],
      });
    });
  });

  return { validSeedBlocks };
}

function constructPower2Blocks({
  roundRobinGroupsCount,
  drawPositionOffset = 0,
  seedNumberOffset = 0,
  seedingProfile,
  seedCountGoal,
  baseDrawSize,
}) {
  let count = 1;
  const blocks = [];

  const { seedBlocks } = getSeedBlocks({
    cluster: getSeedPattern(seedingProfile) === CLUSTER,
    participantsCount: baseDrawSize,
    roundRobinGroupsCount,
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
  drawDefinition,
  seedBlockInfo,
  drawPosition,
  structureId,
  seedNumber,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });

  let validSeedBlocks = seedBlockInfo?.validSeedBlocks;

  if (!validSeedBlocks) {
    validSeedBlocks = getValidSeedBlocks({
      appliedPolicies,
      drawDefinition,
      structure,
    })?.validSeedBlocks;
  }

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

export function getNextSeedBlock({
  provisionalPositioning,
  drawDefinition,
  seedBlockInfo,
  structureId,
  randomize,
  event,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { seedAssignments } = getStructureSeedAssignments({
    provisionalPositioning,
    drawDefinition,
    structure,
    event,
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
  const validSeedBlocks =
    seedBlockInfo?.validSeedBlocks ||
    getValidSeedBlocks({
      provisionalPositioning,
      appliedPolicies,
      drawDefinition,
      structure,
      event,
    })?.validSeedBlocks;
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
      const participantId = assignment?.participantId;
      if (participantId) selectedParticipantIds.push(participantId);
      return participantId;
    })
    .filter(Boolean);

  const placedSeedNumbers = seedAssignments
    .filter((assignment) =>
      placedSeedParticipantIds.includes(assignment.participantId)
    )
    .map((assignment) => assignment.seedNumber);
  const blockSeedNumbers = nextSeedBlock?.seedNumbers || [];

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
      ...filteredAssignments.map((assignment) =>
        getNumericSeedValue(assignment.seedValue)
      )
    );
    const assignmentsWithLowestSeedValue = filteredAssignments.filter(
      (assignment) =>
        getNumericSeedValue(assignment.seedValue) === lowestSeedValue
    );
    const randomizedAssignments = shuffleArray(assignmentsWithLowestSeedValue);
    return randomizedAssignments.pop();
  }
}

export function getSeedPattern(seedingProfile) {
  if (typeof seedingProfile === 'string') return seedingProfile;
  if (typeof seedingProfile === 'object') return seedingProfile.positioning;
}
