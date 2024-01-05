import { getGroupValueGroups } from '../../assemblies/generators/drawDefinitions/getGroupValueGroups';
import { SUCCESS } from '../../constants/resultConstants';
import { ResultType } from '../../global/functions/decorateResult';
import { CollectionDefinition } from '../../types/tournamentTypes';
import { isConvertableInteger } from '../../utilities/math';

type CalculateWinCriteriaArgs = {
  collectionGroups?: { groupValue?: number; groupNumber?: number }[];
  collectionDefinitions?: CollectionDefinition[];
};
export function calculateWinCriteria({
  collectionDefinitions = [],
  collectionGroups = [],
}: CalculateWinCriteriaArgs): ResultType & {
  aggregateValue?: boolean;
  valueGoal?: number;
} {
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

    if (isConvertableInteger(setValue || scoreValue)) {
      // because setValues and scoreValues are unpredictable,
      // any collectionDefintion that has either of these two values without a collectionValue forces the tieFormat to aggregateValue
      aggregateValueImperative = true;
    } else if (belongsToValueGroup) {
      continue;
    } else if (
      typeof collectionValue === 'number' &&
      isConvertableInteger(collectionValue)
    ) {
      valueTotal += collectionValue;
    } else if (collectionValueProfiles?.length) {
      for (const collectionValueProfile of collectionValueProfiles) {
        valueTotal += collectionValueProfile.matchUpValue;
      }
    } else if (
      typeof matchUpValue === 'number' &&
      isConvertableInteger(matchUpValue)
    ) {
      valueTotal += (matchUpCount ?? 0) * matchUpValue;
    }
  }

  for (const collectionGroup of collectionGroups) {
    valueTotal += collectionGroup.groupValue ?? 0;
  }

  if (aggregateValueImperative || !valueTotal)
    return { aggregateValue: true, ...SUCCESS };

  const valueGoal = Math.floor(valueTotal / 2) + 1;

  return { valueGoal, ...SUCCESS };
}
