import { generateRange, UUID } from '../../utilities';

export function generateTieMatchUps({ tieFormat, uuids }) {
  const { collectionDefinitions } = tieFormat || {};

  const tieMatchUps = (collectionDefinitions || [])
    .map((collectionDefinition) => {
      const { matchUpCount, matchUpFormat, matchUpType, collectionId } =
        collectionDefinition || {};

      const matchUps = generateRange(0, matchUpCount || 0).map((index) => {
        const collectionPosition = index + 1;

        const matchUp = {
          collectionId,
          matchUpType,
          matchUpFormat,
          collectionPosition,
          matchUpId: uuids?.pop() || UUID(),
          sides: [{ SideNumber: 1 }, { SideNumber: 2 }],
        };

        return matchUp;
      });

      return matchUps;
    })
    .filter(Boolean)
    .flat();
  return { tieMatchUps };
}
