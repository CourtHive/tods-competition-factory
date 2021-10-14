import { unique, UUID } from '../../../utilities';

import { INVALID_TIE_FORMAT } from '../../../constants/errorConditionConstants';
import { DOUBLES, SINGLES } from '../../../constants/matchUpTypes';

export function validateTieFormat({ tieFormat, checkCollectionIds = true }) {
  if (
    typeof tieFormat !== 'object' ||
    typeof tieFormat.winCriteria !== 'object' ||
    !Array.isArray(tieFormat.collectionDefinitions)
  )
    return { error: INVALID_TIE_FORMAT };

  const errors = [];

  const validCollections = tieFormat.collectionDefinitions.every(
    (collectionDefinition) => {
      if (typeof collectionDefinition !== 'object') return false;

      const {
        collectionValueProfile,
        collectionGroupNumber,
        collectionValue,
        collectionId,
        matchUpCount,
        matchUpValue,
        matchUpType,
      } = collectionDefinition;

      if (checkCollectionIds && typeof collectionId !== 'string') {
        errors.push(`collectionId is not type string: ${collectionId}`);
        return false;
      }
      if (typeof matchUpCount !== 'number') {
        errors.push(`matchUpCount is not type number: ${matchUpCount}`);
        return false;
      }
      if (![SINGLES, DOUBLES].includes(matchUpType)) {
        errors.push(`matchUpType must be SINGLES or DOUBLES: ${matchUpType}`);
        return false;
      }

      if (!matchUpValue && !collectionValue && !collectionValueProfile) {
        errors.push(
          'Missing value definition for matchUps: matchUpValue, collectionValue, or collectionValueProfile'
        );
        return false;
      }

      if (matchUpValue && typeof matchUpValue !== 'number') {
        errors.push(`matchUpValue is not type number: ${matchUpValue}`);
        return false;
      }
      if (collectionValue && typeof collectionValue !== 'number') {
        errors.push(`collectionValue is not type number: ${collectionValue}`);
        return false;
      }
      if (collectionValueProfile) {
        if (!Array.isArray(collectionValueProfile)) {
          errors.push(
            `collectionValueProfile is not an array: ${collectionValueProfile}`
          );
          return false;
        }
        if (collectionValueProfile.length !== matchUpCount) {
          errors.push(
            `collectionValueProfile does not align with matchUpsCount`
          );
          return false;
        }
        for (const valueProfile of collectionValueProfile) {
          if (typeof valueProfile !== 'object') {
            errors.push(`valueProfile is not type object: ${valueProfile}`);
            return false;
          }
          const { value, collectionPosition } = valueProfile;
          if (
            typeof value !== 'number' ||
            typeof collectionPosition !== 'number' ||
            collectionPosition > matchUpCount ||
            collectionPosition < 1
          ) {
            errors.push(
              `Invalid value profile: value and collectionPosition must be numeric. collectionPosition cannot be greater than matchUpCount`
            );
            return false;
          }
        }
        const collectionPositions = collectionValueProfile.map(
          (collectionPosition) => collectionPosition
        );
        if (collectionPositions.length !== unique(collectionPositions).length) {
          errors.push('collectionPositions are not unique');
          return false;
        }
      }

      if (collectionGroupNumber && typeof collectionGroupNumber !== 'number') {
        errors.push(`collectionValue is not type number: ${collectionValue}`);
        return false;
      }

      return true;
    }
  );

  const collectionIds = tieFormat.collectionDefinitions.map(
    ({ collectionId }) => collectionId
  );
  const uniqueCollectionIds =
    !checkCollectionIds ||
    collectionIds.length === unique(collectionIds).length;

  const validWinCriteria = typeof tieFormat.winCriteria.valueGoal === 'number';

  const valid = validCollections && validWinCriteria && uniqueCollectionIds;
  return valid ? { valid: true } : { error: INVALID_TIE_FORMAT };
}

// add collectionIds if missing
export function checkTieFormat(tieFormat) {
  const result = validateTieFormat({ tieFormat, checkCollectionIds: false });
  if (result.error) return result;

  for (const collectionDefinition of tieFormat.collectionDefinitions) {
    if (!collectionDefinition.collectionId)
      collectionDefinition.collectionId = UUID();
  }

  return { tieFormat };
}
