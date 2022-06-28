import { generateRange, UUID } from '../../utilities';

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

  const matchUps = generateRange(0, numberToGenerate).map((index) => {
    const collectionPosition = index + 1;
    const matchUp = {
      sides: [{ sideNumber: 1 }, { sideNumber: 2 }],
      matchUpId: uuids?.pop() || UUID(),
      collectionPosition,
      collectionId,
      matchUpType,
      isMock,
    };

    return matchUp;
  });

  return matchUps;
}
