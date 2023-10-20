import { isConvertableInteger } from '../../../utilities/math';
import { difference, unique } from '../../../utilities/arrays';
import { getTieFormatDesc } from './getTieFormatDescription';

import { TieFormat } from '../../../types/tournamentFromSchema';
import { SUCCESS } from '../../../constants/resultConstants';

type CompareTieFormatsArgs = {
  considerations?: any;
  descendant: TieFormat;
  ancestor: TieFormat;
};

export function compareTieFormats({
  considerations = {},
  descendant,
  ancestor,
}: CompareTieFormatsArgs) {
  const descendantDifferences: any = {};
  const ancestorDifferences: any = {};

  const {
    matchUpFormats: descendantMatchUpFormats,
    tieFormatDesc: descendantDesc,
  } = getTieFormatDesc(descendant);

  const {
    matchUpFormats: ancestorMatchUpFormats,
    tieFormatDesc: ancestorDesc,
  } = getTieFormatDesc(ancestor);

  const matchUpFormatDifferences = unique(
    (descendantMatchUpFormats ?? [])
      .filter((format) => !(ancestorMatchUpFormats ?? []).includes(format))
      .concat(
        (ancestorMatchUpFormats ?? []).filter(
          (format) => !(descendantMatchUpFormats ?? []).includes(format)
        )
      )
  );

  const nameDifference = !!(
    considerations?.collectionName &&
    descendant.collectionDefinitions
      .map(({ collectionName }) => collectionName)
      .join('|') !==
      ancestor.collectionDefinitions
        .map(({ collectionName }) => collectionName)
        .join('|')
  );

  const orderDifference = !!(
    considerations?.collectionOrder &&
    descendant.collectionDefinitions
      .map(({ collectionOrder }) => collectionOrder)
      .join('|') !==
      ancestor.collectionDefinitions
        .map(({ collectionOrder }) => collectionOrder)
        .join('|')
  );

  const descendantCollectionDefinitions = Object.assign(
    {},
    ...(descendant?.collectionDefinitions || []).map(
      (collectionDefinition) => ({
        [collectionDefinition.collectionId]: collectionDefinition,
      })
    )
  );
  const ancestorCollectionDefinitions = Object.assign(
    {},
    ...(ancestor?.collectionDefinitions || []).map((collectionDefinition) => ({
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
    descendantCollectionDefinitions
  );

  ancestorDifferences.collectionsValue = getCollectionsValue(
    ancestorCollectionDefinitions
  );

  descendantDifferences.groupsCount =
    ancestor?.collectionGroups?.length ??
    (0 - (descendant?.collectionGroups?.length ?? 0) || 0);

  ancestorDifferences.groupsCount = descendantDifferences.groupsCount
    ? -1 * descendantDifferences.groupsCount
    : 0;

  const valueDifference =
    descendantDifferences.collectionsValue.totalValue -
    ancestorDifferences.collectionsValue.totalValue;
  const matchUpCountDifference =
    descendantDifferences.collectionsValue.totalMatchUps -
    ancestorDifferences.collectionsValue.totalMatchUps;

  const different =
    nameDifference ||
    orderDifference ||
    ancestorDesc !== descendantDesc ||
    valueDifference !== 0;

  return {
    matchUpFormatDifferences,
    matchUpCountDifference,
    descendantDifferences,
    ancestorDifferences,
    orderDifference,
    valueDifference,
    nameDifference,
    descendantDesc,
    ancestorDesc,
    ...SUCCESS,
    different,
  };
}

function getCollectionsValue(definitions) {
  let totalMatchUps = 0;

  const collectionIds = Object.keys(definitions);
  const totalValue = collectionIds.reduce((total, collectionId) => {
    const collectionDefinition = definitions[collectionId];
    const {
      collectionValueProfiles,
      collectionValue,
      matchUpCount,
      matchUpValue,
      scoreValue,
      setValue,
    } = collectionDefinition;

    totalMatchUps += matchUpCount;

    if (collectionValueProfiles)
      return (
        total +
        collectionValueProfiles.reduce(
          (total, profile) => total + profile.value,
          0
        )
      );

    if (matchUpCount) {
      if (isConvertableInteger(matchUpValue))
        return total + matchUpValue * matchUpCount;

      if (isConvertableInteger(scoreValue))
        return total + scoreValue * matchUpCount;

      if (isConvertableInteger(setValue))
        return total + setValue * matchUpCount;

      return total + collectionValue;
    }

    return total;
  }, 0);

  return { totalValue, totalMatchUps };
}
