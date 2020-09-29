import { findStructure } from '../../getters/findStructure';
import { getValidSeedBlocks } from '../../getters/seedGetter';
import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { positionTargets } from '../../governors/positionGovernor/positionTargets';
import { getStructurePositionedSeeds } from '../../governors/positionGovernor/positionSeeds';
import { assignMatchUpDrawPosition } from '../../governors/matchUpGovernor/matchUpDrawPosition';
import {
  chunkArray,
  numericSort,
  shuffleArray,
  unique,
} from '../../../utilities';

import { structureAssignedDrawPositions } from '../../getters/positionsGetter';
import { structureActiveDrawPositions } from '../../getters/structureActiveDrawPositions';

import {
  stageEntries,
  getStageQualifiersCount,
} from '../../getters/stageGetter';

import {
  CONTAINER,
  DIRECT_ACCEPTANCE,
  WILDCARD,
} from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { BYE } from '../../../constants/matchUpStatusConstants';
import { setMatchUpStatus } from '../matchUpGovernor/matchUpStatus';
import { getAppliedPolicies } from '../policyGovernor/getAppliedPolicies';

export function assignDrawPositionBye({
  drawDefinition,
  structureId,
  drawPosition,
}) {
  const { structure } = findStructure({ drawDefinition, structureId });
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const { byesCount, placedByes } = getByesData({ drawDefinition, structure });
  const { activeDrawPositions } = structureActiveDrawPositions({
    drawDefinition,
    structureId,
  });
  const drawPositionIsActive = activeDrawPositions.includes(drawPosition);

  const positionsAvailable = placedByes < byesCount;
  const positionState = positionAssignments.reduce(
    (p, c) => (c.drawPosition === drawPosition ? c : p),
    undefined
  );

  if (!positionsAvailable) return { error: 'Exceeds byesCount' };
  if (!positionState) return { error: 'Invalid draw position' };
  if (drawPositionFilled(positionState))
    return { error: 'Draw position is occupied' };
  if (drawPositionIsActive)
    return { error: 'Cannot place bye in active drawPosition' };

  positionAssignments.forEach(assignment => {
    if (assignment.drawPosition === drawPosition) {
      assignment.bye = true;
    }
  });

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure,
    matchUpFilters,
  });

  matchUps.forEach(matchUp => {
    if (matchUp.drawPositions.includes(drawPosition)) {
      const { matchUpId } = matchUp;
      setMatchUpStatus({
        drawDefinition,
        matchUpId,
        matchUpStatus: BYE,
      });

      const pairedDrawPosition = matchUp.drawPositions.reduce(
        (pairedDrawPosition, currentDrawPosition) => {
          return currentDrawPosition !== drawPosition
            ? currentDrawPosition
            : pairedDrawPosition;
        },
        undefined
      );

      // if there is a linked draw then BYE must also be placed there
      // This must be propagated through compass draw, for instance
      const {
        targetLinks: { loserTargetLink },
        targetMatchUps: { loserMatchUp, winnerMatchUp },
      } = positionTargets({ drawDefinition, matchUpId });

      if (loserMatchUp) {
        // loserMatchUp must have both drawPositions defined
        const loserMatchUpDrawPositionsCount = loserMatchUp.drawPositions.filter(
          f => f
        ).length;
        if (loserMatchUpDrawPositionsCount !== 2)
          return { error: 'Missing drawPositions in loserMatchUp' };
        // drawPositions must be in numerical order
        loserMatchUp.drawPositions = loserMatchUp.drawPositions.sort(
          numericSort
        );
        // loser drawPosition in target structure is determined bye even/odd
        const targetDrawPositionIndex = 1 - (matchUp.roundPosition % 2);

        const targetDrawPosition =
          loserMatchUp.drawPositions[targetDrawPositionIndex];
        assignDrawPositionBye({
          drawDefinition,
          structureId: loserTargetLink.target.structureId,
          drawPosition: targetDrawPosition,
        });
      }

      if (winnerMatchUp && pairedDrawPosition) {
        // TODO: is it possible that a WINNER could be directed to a different structure?
        // winner participantId would then need to be added to positionAssignments
        assignMatchUpDrawPosition({
          drawDefinition,
          matchUpId: winnerMatchUp.matchUpId,
          drawPosition: pairedDrawPosition,
        });
      }
    }
  });

  return SUCCESS;

  function drawPositionFilled(positionState) {
    const containsBye = positionState.bye;
    const containsQualifier = positionState.qualifier;
    const containsParticipant = positionState.participantId;
    return containsBye || containsQualifier || containsParticipant;
  }
}

export function positionByes({
  drawDefinition,
  structure,
  structureId,
  blockOrdered = false,
}) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);
  const { byesCount, placedByes, relevantMatchUps } = getByesData({
    drawDefinition,
    structure,
  });

  const byesToPlace = byesCount - placedByes;
  if (byesToPlace < 0) return { error: 'Too many byes have been placed' };
  if (byesToPlace === 0) return SUCCESS;

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const {
    isFeedIn,
    strictSeedOrderByePositions,
    blockSeedOrderByePositions,
  } = getSeedOrderByePositions({
    appliedPolicies,
    structure,
    relevantMatchUps,
  });

  const seedOrderByePositions = blockOrdered
    ? blockSeedOrderByePositions
    : strictSeedOrderByePositions;

  const { unseededByePositions } = getUnseededByePositions({
    appliedPolicies,
    structure,
    isFeedIn,
  });
  // first add all drawPositions paired with sorted seeds drawPositions
  // then add quarter separated dnd evenly distributed drawPositions
  // derived from theoretical seeding of firstRoundParticipants/2
  const byePositions = [].concat(
    ...seedOrderByePositions,
    ...unseededByePositions
  );

  // then take only the number of required byes
  const byeDrawPositions = byePositions.slice(0, byesToPlace);

  for (const drawPosition of byeDrawPositions) {
    const result = assignDrawPositionBye({
      drawDefinition,
      structureId,
      drawPosition,
    });
    if (result && result.error) return result;
  }

  return SUCCESS;
}

function getUnseededByePositions({ structure, appliedPolicies, isFeedIn }) {
  const seedBlocks = appliedPolicies?.seeding?.seedBlocks;
  const { positionAssignments } = structureAssignedDrawPositions({ structure });
  const filledDrawPositions = positionAssignments
    .filter(assignment => assignment.participantId)
    .map(assignment => assignment.drawPosition);

  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps, roundMatchUps } = getAllStructureMatchUps({
    structure,
    matchUpFilters,
  });
  const firstRoundMatchUps = (roundMatchUps && roundMatchUps[1]) || [];

  // firstRoundMatchUps don't work for CONTAINER / ROUND_ROBIN structures
  const relevantMatchUps =
    structure.structureType === CONTAINER ? matchUps : firstRoundMatchUps;
  const relevantDrawPositions = unique(
    [].concat(...relevantMatchUps.map(matchUp => matchUp.drawPositions))
  );
  const drawPositionOffset = Math.min(...relevantDrawPositions) - 1;

  const filledRelevantDrawPositions = filledDrawPositions.filter(drawPosition =>
    relevantDrawPositions.includes(drawPosition)
  );

  const getHalves = chunk => {
    const halfLength = Math.ceil(chunk.length / 2);
    const halves = [chunk.slice(0, halfLength), chunk.slice(halfLength)];
    const halfLengths = halves.map(
      half => [].concat(...half.flat(Infinity)).length
    );
    const shortLength = Math.min(...halfLengths.flat(Infinity));
    const longLength = Math.max(...halfLengths.flat(Infinity));
    const longIndex = halfLengths.indexOf(longLength);
    const unequalHalves = shortLength !== longLength;
    const shuffledHalves = shuffleArray(halves);
    const [greaterHalf, lesserHalf] =
      !shortLength || unequalHalves
        ? [halves[longIndex], halves[1 - longIndex]]
        : [shuffledHalves[0], shuffledHalves[1]];
    return { greaterHalf, lesserHalf };
  };
  const getNextDrawPosition = chunks => {
    const { greaterHalf, lesserHalf } = getHalves(chunks);
    const {
      greaterHalf: greaterQuarter,
      lesserHalf: lesserQuarter,
    } = getHalves(greaterHalf);
    const shuffledQuarter = shuffleArray(greaterQuarter.flat(Infinity));
    const drawPosition = shuffledQuarter.pop();
    const diminishedQuarter = greaterQuarter
      .flat()
      .filter(position => position !== drawPosition);
    const newlyFilteredChunks = [
      ...lesserHalf,
      ...lesserQuarter,
      diminishedQuarter,
    ];
    return { newlyFilteredChunks, drawPosition };
  };
  const unfilledDrawPosition = drawPosition =>
    !filledRelevantDrawPositions.includes(drawPosition);
  const quarterSeparateBlock = block => {
    const sortedChunked = chunkArray(
      block.sort(numericSort),
      Math.ceil(block.length / 4)
    );
    let filteredChunks = sortedChunked.map(chunk =>
      chunk.filter(unfilledDrawPosition)
    );
    const drawPositionCount = [].concat(...filteredChunks.flat(Infinity))
      .length;
    const orderedDrawPositions = [];
    for (let i = 0; i < drawPositionCount; i++) {
      const { newlyFilteredChunks, drawPosition } = getNextDrawPosition(
        filteredChunks
      );
      orderedDrawPositions.push(drawPosition);
      filteredChunks = newlyFilteredChunks;
    }
    return orderedDrawPositions;
  };

  // setting allPositions: true returns seedBlocks for all positions
  // overriding the default which returns only seedBlocks for seedsCount
  const { validSeedBlocks } = getValidSeedBlocks({
    structure,
    appliedPolicies,
    allPositions: true,
  });
  const validBlockDrawPositions = validSeedBlocks.map(block =>
    block.drawPositions.map(drawPosition => drawPosition + drawPositionOffset)
  );
  let unfilledSeedBlocks = validBlockDrawPositions
    .map(quarterSeparateBlock)
    .filter(block => block.length);

  if (isFeedIn) {
    // FEED_IN structures calculate seedDrawPositions uniquely
    // and require a special case to properly calculate bye positions
    const baseDrawSize = relevantDrawPositions.length;
    const blockDrawPositions = Object.keys(seedBlocks)
      .filter(key => key < baseDrawSize / 2)
      .map(key => {
        const seedDrawPositions = seedBlocks[key].map(
          d => +d[0] + baseDrawSize * d[1]
        );
        return seedDrawPositions.map(
          drawPosition => drawPosition + drawPositionOffset
        );
      });

    unfilledSeedBlocks = blockDrawPositions
      .map(quarterSeparateBlock)
      .filter(block => block.length);
  }

  // for Round Robins pairs need to be reduced to pairs in drawPosition order
  const matchUpPairedDrawPositions = relevantMatchUps
    .map(matchUp => matchUp.drawPositions)
    .map(pair => pair.sort((a, b) => a - b))
    .filter(pair => pair[0] + 1 === pair[1]);

  const findDrawPositionPair = drawPosition => {
    return matchUpPairedDrawPositions.reduce((pair, candidate) => {
      return candidate.includes(drawPosition)
        ? candidate.reduce((p, c) => (c !== drawPosition ? c : p), undefined)
        : pair;
    }, undefined);
  };

  const unseededByePositions = unfilledSeedBlocks
    .map(block => block.map(findDrawPositionPair))
    .flat(Infinity)
    .filter(f => f);

  return { unseededByePositions };
}

function getSeedOrderByePositions({
  structure,
  appliedPolicies,
  relevantMatchUps,
}) {
  const { validSeedBlocks, isFeedIn, isContainer } = getValidSeedBlocks({
    appliedPolicies,
    structure,
  });
  const positionedSeeds = getStructurePositionedSeeds({ structure });

  const relevantDrawPositions = unique(
    [].concat(...relevantMatchUps.map(matchUp => matchUp.drawPositions))
  );
  const relevantPositionedSeeds = positionedSeeds.filter(positionedSeed => {
    return relevantDrawPositions.includes(positionedSeed.drawPosition);
  });

  const blockSortedRandomDrawPositions = []
    .concat(
      ...validSeedBlocks.map(seedBlock => shuffleArray(seedBlock.drawPositions))
    )
    .filter(drawPosition => relevantDrawPositions.includes(drawPosition));

  // within seedBlocks positionedSeeds are sorted by seedValue to handle the situation
  // where there are multiple players seeded with the same seedValue which have been
  // randomly assigned to different seedBlocks
  // Example: more than one 4th seed, but only one of them placed in the 3-4 seed block
  // 3rd seed must get 3rd Bye, and 4th seed placed in the 3-4 seed block must get 4th bye
  const seedValueSort = (a, b) => a.seedValue - b.seedValue;
  const valueOrderedBlockSortedPositionedSeeds = validSeedBlocks.reduce(
    (result, seedBlock) => {
      const positionedSeedsInBlock = relevantPositionedSeeds
        .filter(positionedSeed =>
          seedBlock.drawPositions.includes(positionedSeed.drawPosition)
        )
        .sort(seedValueSort);
      return result.concat(...positionedSeedsInBlock);
    },
    []
  );
  const orderedSortedFirstRoundSeededDrawPositions = valueOrderedBlockSortedPositionedSeeds.map(
    positionedSeed => positionedSeed.drawPosition
  );

  // returns list of bye positions which strictly follows where seeds
  // have been placed according to sorted seedNumbers
  const strictSeedOrderByePositions = getOrderedByePositions({
    orderedSeedDrawPositions: orderedSortedFirstRoundSeededDrawPositions,
    relevantMatchUps,
  }).slice(0, positionedSeeds.length);

  // returns list of bye positions where the seedBlocks are ordered but
  // where the placement of seeds within blocks is not considered
  const blockSeedOrderByePositions = getOrderedByePositions({
    orderedSeedDrawPositions: blockSortedRandomDrawPositions,
    relevantMatchUps,
  }).slice(0, positionedSeeds.length);

  return {
    strictSeedOrderByePositions,
    blockSeedOrderByePositions,
    isFeedIn,
    isContainer,
  };
}

function getOrderedByePositions({
  orderedSeedDrawPositions,
  relevantMatchUps,
}) {
  // if relevantMatchUps excludes FEED_IN rounds...
  // matchUpDrawPositions will equal firstRoundDrawPositions
  // In CONTAINER/ROUND_ROBIN structures drawPositions are duplicated
  // and therefore must placed in drawOrder within Groups

  const matchUpDrawPositionPairs = relevantMatchUps.map(
    matchUp => matchUp.drawPositions
  );
  const consideredDrawPositionPairs = matchUpDrawPositionPairs
    .map(pair => pair.sort((a, b) => a - b))
    .filter(pair => pair[0] + 1 === pair[1]);

  // sort seededMatchUps so that pairedPositions represent seed order
  const seedOrderSortedDrawPositionPairs = orderedSeedDrawPositions
    .map(drawPosition => {
      return consideredDrawPositionPairs.reduce(
        (drawPositionPair, drawPositions) => {
          if (drawPositionPair) return drawPositionPair; // take the first occurrence
          return drawPositions.includes(drawPosition)
            ? drawPositions
            : drawPositionPair;
        },
        undefined
      );
    })
    .filter(f => f);
  const orderedByePositions = seedOrderSortedDrawPositionPairs
    .map(drawPositions => {
      return drawPositions.reduce((byePosition, drawPosition) => {
        return orderedSeedDrawPositions.includes(drawPosition)
          ? byePosition
          : drawPosition;
      }, undefined);
    })
    .filter(f => f);

  return orderedByePositions;
}

export function getByesData({ drawDefinition, structure }) {
  const matchUpFilters = { isCollectionMatchUp: false };
  const { matchUps, roundMatchUps } = getAllStructureMatchUps({
    drawDefinition,
    structure,
    matchUpFilters,
  });
  const firstRoundMatchUps = (roundMatchUps && roundMatchUps[1]) || [];

  // firstRoundMatchUps don't work for CONTAINER / ROUND_ROBIN structures
  const relevantMatchUps =
    structure.structureType === CONTAINER ? matchUps : firstRoundMatchUps;
  const relevantMatchUpsCount = relevantMatchUps.length;
  const maxByes = relevantMatchUpsCount;

  // get stage/stageSequence Entries and qualifiers
  const { stage, stageSequence } = structure;
  const entryTypes = [DIRECT_ACCEPTANCE, WILDCARD];
  const entries = stageEntries({
    drawDefinition,
    stage,
    stageSequence,
    entryTypes,
  });
  const qualifiersCount = getStageQualifiersCount({ drawDefinition, stage });
  const entriesCount = entries.length + qualifiersCount;

  // # Byes = drawSize (positionAssignments) - total entries
  // const { positionAssignments } = structureAssignedDrawPositions({structure});
  // const { positionAssignments, qualifierPositions, byePositions, unassignedPositions } = structureAssignedDrawPositions({structure});
  const {
    positionAssignments,
    unassignedPositions,
  } = structureAssignedDrawPositions({ structure });
  const unassignedDrawPositions = unassignedPositions.map(
    position => position.drawPosition
  );
  const placedByes = positionAssignments.filter(assignment => assignment.bye)
    .length;
  const placedByePositions = positionAssignments
    .filter(assignment => assignment.bye)
    .map(assignment => assignment.drawPosition);

  const validByePositions = relevantMatchUps
    .map(matchUp => matchUp.drawPositions)
    .filter(drawPositions => {
      return (
        drawPositions &&
        drawPositions.reduce(
          (noBye, drawPosition) =>
            !placedByePositions.includes(drawPosition) && noBye,
          true
        )
      );
    })
    .flat(Infinity)
    .filter(drawPosition => unassignedDrawPositions.includes(drawPosition));

  // maxByes limitation applies only to stageSequence #1
  // when doubleByes are supported may do away with maxByes
  const drawSize = positionAssignments.length;
  let byesCount = drawSize - entriesCount;
  if (byesCount > maxByes && structure.stageSequence === 1) {
    byesCount = maxByes;
  }

  return {
    placedByes,
    byesCount,
    relevantMatchUps,
    placedByePositions,
    roundMatchUps,
    validByePositions,
  };
}
