import { getStructurePositionedSeeds } from '../../../getters/getStructurePositionedSeeds';
import { getValidSeedBlocks } from '../../../getters/seedGetter';
import { shuffleArray, unique } from '../../../../utilities';

export function getSeedOrderByePositions({
  structure,
  drawDefinition,
  appliedPolicies,
  relevantMatchUps,
}) {
  const { validSeedBlocks, isFeedIn, isContainer } = getValidSeedBlocks({
    appliedPolicies,
    drawDefinition,
    structure,
  });
  const positionedSeeds = getStructurePositionedSeeds({
    drawDefinition,
    structure,
  });

  const relevantDrawPositions = unique(
    [].concat(...relevantMatchUps.map((matchUp) => matchUp.drawPositions))
  );
  const relevantPositionedSeeds = positionedSeeds.filter((positionedSeed) => {
    return relevantDrawPositions.includes(positionedSeed.drawPosition);
  });

  const blockSortedRandomDrawPositions = []
    .concat(
      ...validSeedBlocks.map((seedBlock) =>
        shuffleArray(seedBlock.drawPositions)
      )
    )
    .filter((drawPosition) => relevantDrawPositions.includes(drawPosition));

  // within seedBlocks positionedSeeds are sorted by seedValue to handle the situation
  // where there are multiple players seeded with the same seedValue which have been
  // randomly assigned to different seedBlocks
  // Example: more than one 4th seed, but only one of them placed in the 3-4 seed block
  // 3rd seed must get 3rd Bye, and 4th seed placed in the 3-4 seed block must get 4th bye
  const seedValueSort = (a, b) => a.seedValue - b.seedValue;
  const valueOrderedBlockSortedPositionedSeeds = validSeedBlocks.reduce(
    (result, seedBlock) => {
      const positionedSeedsInBlock = relevantPositionedSeeds
        .filter((positionedSeed) =>
          seedBlock.drawPositions?.includes(positionedSeed.drawPosition)
        )
        .sort(seedValueSort);
      return result.concat(...positionedSeedsInBlock);
    },
    []
  );
  const orderedSortedFirstRoundSeededDrawPositions =
    valueOrderedBlockSortedPositionedSeeds.map(
      (positionedSeed) => positionedSeed.drawPosition
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
    (matchUp) => matchUp.drawPositions
  );
  const consideredDrawPositionPairs = matchUpDrawPositionPairs
    .map((pair) => pair.sort((a, b) => a - b))
    .filter((pair) => pair[0] + 1 === pair[1]);

  // sort seededMatchUps so that pairedPositions represent seed order
  const seedOrderSortedDrawPositionPairs = orderedSeedDrawPositions
    .map((drawPosition) => {
      return consideredDrawPositionPairs.reduce(
        (drawPositionPair, drawPositions) => {
          if (drawPositionPair) return drawPositionPair; // take the first occurrence
          return drawPositions?.includes(drawPosition)
            ? drawPositions
            : drawPositionPair;
        },
        undefined
      );
    })
    .filter((f) => f);
  const orderedByePositions = seedOrderSortedDrawPositionPairs
    .map((drawPositions) => {
      return drawPositions?.reduce((byePosition, drawPosition) => {
        return orderedSeedDrawPositions.includes(drawPosition)
          ? byePosition
          : drawPosition;
      }, undefined);
    })
    .filter((f) => f);

  return orderedByePositions;
}
