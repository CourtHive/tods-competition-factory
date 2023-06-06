import { getStructurePositionedSeeds } from '../../../getters/getStructurePositionedSeeds';
import { getBlockSortedRandomDrawPositions } from './getBlockSortedRandomDrawPositions';
import { getNumericSeedValue } from '../../../getters/getNumericSeedValue';
import { getValidSeedBlocks } from '../../../getters/seedGetter';
import { unique } from '../../../../utilities';

export function getSeedOrderByePositions({
  provisionalPositioning,
  relevantMatchUps,
  appliedPolicies,
  drawDefinition,
  seedBlockInfo,
  byesToPlace,
  structure,
}) {
  if (!seedBlockInfo) {
    seedBlockInfo = getValidSeedBlocks({
      provisionalPositioning,
      appliedPolicies,
      drawDefinition,
      structure,
    });
  }

  let { validSeedBlocks, isFeedIn, isLucky, isContainer } = seedBlockInfo;
  if (appliedPolicies?.seeding?.containerByesIgnoreSeeding)
    validSeedBlocks = [];

  const positionedSeeds = getStructurePositionedSeeds({
    provisionalPositioning,
    drawDefinition,
    structure,
  });

  const relevantDrawPositions = unique(
    [].concat(...relevantMatchUps.map((matchUp) => matchUp.drawPositions))
  );
  const relevantPositionedSeeds = positionedSeeds.filter((positionedSeed) => {
    return relevantDrawPositions.includes(positionedSeed.drawPosition);
  });

  const blockSortedRandomDrawPositions = getBlockSortedRandomDrawPositions({
    validSeedBlocks,
    byesToPlace,
  });

  // within seedBlocks positionedSeeds are sorted by seedValue to handle the situation
  // where there are multiple players seeded with the same seedValue which have been
  // randomly assigned to different seedBlocks
  // Example: more than one 4th seed, but only one of them placed in the 3-4 seed block
  // 3rd seed must get 3rd Bye, and 4th seed placed in the 3-4 seed block must get 4th bye
  const seedValueSort = (a, b) =>
    getNumericSeedValue(a.seedValue) - getNumericSeedValue(b.seedValue);
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

  const blockSeedOrderByePositions = getOrderedByePositions({
    orderedSeedDrawPositions: blockSortedRandomDrawPositions,
    relevantMatchUps,
  }).slice(0, positionedSeeds.length);

  return {
    blockSeedOrderByePositions,
    strictSeedOrderByePositions,
    isContainer,
    isFeedIn,
    isLucky,
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
    .map((pair) => pair?.sort((a, b) => a - b))
    .filter((pair) => pair?.[0] + 1 === pair?.[1]);

  // sort seededMatchUps so that pairedPositions represent seed order
  const seedOrderSortedDrawPositionPairs = orderedSeedDrawPositions
    .map((drawPosition) =>
      consideredDrawPositionPairs.find((drawPositions) =>
        drawPositions?.includes(drawPosition)
      )
    )
    .filter(Boolean);

  return seedOrderSortedDrawPositionPairs
    .map((drawPositions) => {
      return drawPositions?.reduce((byePosition, drawPosition) => {
        const included = orderedSeedDrawPositions.includes(drawPosition);
        return included ? byePosition : drawPosition;
      }, undefined);
    })
    .filter(Boolean);
}
