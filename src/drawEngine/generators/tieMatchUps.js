import { generateRange, UUID } from '../../utilities';

export function generateTieMatchUps({ tieFormat, uuids, isMock }) {
  const { collectionDefinitions } = tieFormat || {};

  const tieMatchUps = (collectionDefinitions || [])
    .map((collectionDefinition) => {
      const { matchUpCount, matchUpFormat, matchUpType, collectionId } =
        collectionDefinition || {};

      const matchUps = generateRange(0, matchUpCount || 0).map((index) => {
        const collectionPosition = index + 1;

        const matchUp = {
          sides: [{ sideNumber: 1 }, { sideNumber: 2 }],
          matchUpId: uuids?.pop() || UUID(),
          collectionPosition,
          matchUpFormat,
          collectionId,
          matchUpType,
          isMock,
        };

        return matchUp;
      });

      return matchUps;
    })
    .filter(Boolean)
    .flat();

  return { tieMatchUps };
}
