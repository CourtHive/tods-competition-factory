import { getGroupValueGroups } from '../../../drawEngine/generators/getGroupValueGroups';
import { CollectionDefinition } from '../../../types/tournamentFromSchema';

type CalculateWinCriteriaArgs = {
  collectionDefinitions?: CollectionDefinition[];
  collectionGroups?: any[];
};
export function calculateWinCriteria({
  collectionDefinitions = [],
  collectionGroups = [],
}: CalculateWinCriteriaArgs) {
  let valueTotal = 0;

  const { groupValueNumbers } = getGroupValueGroups({ collectionGroups });

  let aggregateValueImperative;

  for (const collectionDefinition of collectionDefinitions || []) {
    const {
      collectionValueProfiles,
      collectionGroupNumber,
      collectionValue,
      matchUpCount,
      matchUpValue,
      scoreValue,
      setValue,
    } = collectionDefinition;

    const belongsToValueGroup =
      collectionGroupNumber &&
      groupValueNumbers.includes(collectionGroupNumber);

    if (setValue || scoreValue) {
      // because setValues and scoreValues are unpredictable,
      // any collectionDefintion that has either of these two values without a collectionValue forces the tieFormat to aggregateValue
      aggregateValueImperative = true;
    } else if (belongsToValueGroup) {
      continue;
    } else if (collectionValue) {
      valueTotal += collectionValue;
    } else if (collectionValueProfiles?.length) {
      for (const collectionValueProfile of collectionValueProfiles) {
        valueTotal += collectionValueProfile.matchUpValue;
      }
    } else if (matchUpValue) {
      valueTotal += (matchUpCount || 0) * matchUpValue;
    } else {
      // default is to give each matchUp a value of 1
      valueTotal += matchUpCount || 0;
    }
  }

  for (const collectionGroup of collectionGroups) {
    valueTotal += collectionGroup.groupValue || 0;
  }

  if (aggregateValueImperative || !valueTotal) return { aggregateValue: true };

  const valueGoal = Math.floor(valueTotal / 2) + 1;

  return { valueGoal };
}
