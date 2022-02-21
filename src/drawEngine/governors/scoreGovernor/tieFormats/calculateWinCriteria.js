export function calculateWinCriteria({ collectionDefinitions }) {
  let valueTotal = 0;

  for (const collectionDefinition of collectionDefinitions) {
    const {
      collectionValueProfiles,
      collectionValue,
      matchUpCount,
      matchUpValue,
    } = collectionDefinition;

    if (collectionValue) {
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

  if (!valueTotal) return { aggregateValue: true };

  const valueGoal = Math.floor(valueTotal / 2) + 1;

  return { valueGoal };
}
