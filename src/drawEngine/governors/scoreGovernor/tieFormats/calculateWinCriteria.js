import { getGroupValueGroups } from '../../../generators/getGroupValueGroups';

export function calculateWinCriteria({
  collectionDefinitions = [],
  collectionGroups = [],
} = {}) {
  let valueTotal = 0;

  const { groupValueNumbers } = getGroupValueGroups({ collectionGroups });

  for (const collectionDefinition of collectionDefinitions || []) {
    const {
      collectionValueProfiles,
      collectionGroupNumber,
      collectionValue,
      matchUpCount,
      matchUpValue,
    } = collectionDefinition;

    const belongsToValueGroup =
      collectionGroupNumber &&
      groupValueNumbers.includes(collectionGroupNumber);

    if (belongsToValueGroup) {
      continue;
    } else if (collectionValue) {
      valueTotal += collectionValue;
      continue;
    } else if (collectionValueProfiles) {
      for (const collectionValueProfile of collectionValueProfiles) {
        valueTotal += collectionValueProfile.matchUpValue;
      }
      continue;
    } else if (matchUpValue) {
      valueTotal += matchUpCount * matchUpValue;
      continue;
    }
  }

  for (const collectionGroup of collectionGroups) {
    valueTotal += collectionGroup.groupValue || 0;
  }

  if (!valueTotal) return { aggregateValue: true };

  const valueGoal = Math.floor(valueTotal / 2) + 1;

  return { valueGoal };
}
