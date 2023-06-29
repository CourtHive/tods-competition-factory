import { generateRange, UUID } from '../../utilities';

import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';

export function generateTieMatchUps({ tieFormat, uuids, isMock }) {
  const { collectionDefinitions } = tieFormat || {};

  const tieMatchUps = (collectionDefinitions || [])
    .map((collectionDefinition) =>
      generateCollectionMatchUps({ collectionDefinition, uuids, isMock })
    )
    .filter(Boolean)
    .flat();

  return { tieMatchUps };
}

export function generateCollectionMatchUps({
  collectionDefinition,
  matchUpsLimit, // internal use allows generation of missing matchUps on "reset"
  isMock,
  uuids,
}) {
  const { matchUpCount, matchUpType, collectionId } =
    collectionDefinition || {};

  const numberToGenerate = matchUpsLimit || matchUpCount || 0;

  return generateRange(0, numberToGenerate).map((index) => {
    const collectionPosition = index + 1;
    return {
      sides: [{ sideNumber: 1 }, { sideNumber: 2 }],
      matchUpId: uuids?.pop() || UUID(),
      matchUpStatus: TO_BE_PLAYED,
      collectionPosition,
      collectionId,
      matchUpType,
      isMock,
    };
  });
}
