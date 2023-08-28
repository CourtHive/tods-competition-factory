import { getTieFormatDesc } from '../../../tournamentEngine/governors/reportGovernor/getTieFormatDescription';
import { difference, unique } from '../../../utilities/arrays';

import { SUCCESS } from '../../../constants/resultConstants';
import { TieFormat } from '../../../types/tournamentFromSchema';

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
    (descendantMatchUpFormats || [])
      .filter((format) => !(ancestorMatchUpFormats || []).includes(format))
      .concat(
        (ancestorMatchUpFormats || []).filter(
          (format) => !(descendantMatchUpFormats || []).includes(format)
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

  const different =
    nameDifference || orderDifference || ancestorDesc !== descendantDesc;

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
    descendantCollectionDefinitions,
    descendantDifferences
  );

  ancestorDifferences.collectionsValue = getCollectionsValue(
    ancestorCollectionDefinitions,
    ancestorDifferences
  );

  descendantDifferences.groupsCount =
    ancestor?.collectionGroups?.length ||
    0 - (descendant?.collectionGroups?.length || 0) ||
    0;

  ancestorDifferences.groupsCount = descendantDifferences.groupsCount
    ? -1 * descendantDifferences.groupsCount
    : 0;

  const valueDifference =
    descendantDifferences.collectionsValue.totalValue -
    ancestorDifferences.collectionsValue.totalValue;
  const matchUpCountDifference =
    descendantDifferences.collectionsValue.totalMatchUps -
    ancestorDifferences.collectionsValue.totalMatchUps;

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

function getCollectionsValue(definitions, aggregator) {
  let totalMatchUps = 0;

  const totalValue = aggregator.collectionIds.reduce((total, collectionId) => {
    const collectionDefinition = definitions[collectionId];
    const {
      collectionValueProfiles,
      collectionValue,
      matchUpCount,
      matchUpValue,
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

    if (matchUpValue && matchUpCount)
      return total + matchUpValue * matchUpCount;

    return total + collectionValue;
  }, 0);

  return { totalValue, totalMatchUps };
}
