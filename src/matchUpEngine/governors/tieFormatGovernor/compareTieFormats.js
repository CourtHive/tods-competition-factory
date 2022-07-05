import { difference } from '../../../utilities/arrays';

import { SUCCESS } from '../../../constants/resultConstants';

export function compareTieFormats({ ancestor, descendant }) {
  const descendantDifferences = {};
  const ancestorDifferences = {};

  const descendantCollectionDefinitions = Object.assign(
    {},
    ...descendant.collectionDefinitions.map((collectionDefinition) => ({
      [collectionDefinition.collectionId]: collectionDefinition,
    }))
  );
  const ancestorCollectionDefinitions = Object.assign(
    {},
    ...ancestor.collectionDefinitions.map((collectionDefinition) => ({
      [collectionDefinition.collectionId]: collectionDefinition,
    }))
  );

  descendantDifferences.collectionIds = difference(
    Object.keys(descendantCollectionDefinitions),
    Object.keys(ancestorCollectionDefinitions)
  );
  ancestorDifferences.collectionIds = difference(
    Object.keys(ancestorCollectionDefinitions),
    Object.keys(descendantCollectionDefinitions)
  );

  descendantDifferences.collectionsValue = getCollectionsValue(
    descendantCollectionDefinitions,
    descendantDifferences
  );

  ancestorDifferences.collectionsValue = getCollectionsValue(
    ancestorCollectionDefinitions,
    ancestorDifferences
  );

  descendantDifferences.groupsCount =
    ancestor.collectionGroups?.length ||
    0 - descendant.collectionGroups?.length ||
    0;

  ancestorDifferences.groupsCount = -1 * descendantDifferences.groupsCount;

  return { ...SUCCESS, ancestorDifferences, descendantDifferences };
}

function getCollectionsValue(definitions, aggregator) {
  let totalMatchUps = 0;

  const totalValue = aggregator.collectionIds.reduce((total, collectionId) => {
    const collectionDefinition = definitions[collectionId];
    const {
      collectionValueProfile,
      collectionValue,
      matchUpCount,
      matchUpValue,
    } = collectionDefinition;

    totalMatchUps += matchUpCount;

    if (collectionValueProfile)
      return collectionValueProfile.reduce(
        (total, profile) => total + profile.value,
        0
      );
    if (matchUpValue && matchUpCount) return matchUpValue * matchUpCount;
    return collectionValue;
  }, 0);

  return { totalValue, totalMatchUps };
}
