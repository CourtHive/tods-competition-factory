import tieFormatDefaults from '../../tournamentEngine/generators/tieFormatDefaults';
import { UUID } from '../../utilities';

import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import {
  FEMALE,
  MIXED,
  OTHER,
  MALE,
  ANY,
} from '../../constants/genderConstants';

export function processTieFormat({
  alternatesCount = 0,
  tieFormatName,
  tieFormat,
  drawSize,
}) {
  let maxDoublesCount = 0,
    maxSinglesCount = 0;

  let singlesMatchUpTotal = 0,
    doublesMatchUpTotal = 0;

  const categories = {};
  const genders = { [MALE]: 0, [FEMALE]: 0, [MIXED]: 0, [OTHER]: 0, [ANY]: 0 };

  tieFormat =
    typeof tieFormat === 'object'
      ? tieFormat
      : tieFormatDefaults({ namedFormat: tieFormatName });

  tieFormat?.collectionDefinitions
    ?.filter(Boolean)
    .forEach((collectionDefinition) => {
      const { category, collectionId, matchUpType, matchUpCount, gender } =
        collectionDefinition;

      if ([MALE, FEMALE].includes(gender)) {
        const required = matchUpCount * (matchUpType === DOUBLES ? 2 : 1);
        if (genders[gender] < required) genders[gender] = required;
      } else if (gender === MIXED) {
        if (genders[MALE] < matchUpCount) genders[MALE] = matchUpCount;
        if (genders[FEMALE] < matchUpCount) genders[FEMALE] = matchUpCount;
      }

      if (category) {
        const categoryString = JSON.stringify(category);
        categories[categoryString] = category;
      }

      // ensure every collectionDefinition has a collectionId
      if (!collectionId) collectionDefinition.collectionId = UUID();

      if (matchUpType === DOUBLES) {
        const doublesCount = matchUpCount;
        doublesMatchUpTotal += matchUpCount;
        maxDoublesCount = Math.max(maxDoublesCount, doublesCount);
      }

      if (matchUpType === SINGLES) {
        const singlescount = matchUpCount;
        singlesMatchUpTotal += matchUpCount;
        maxSinglesCount = Math.max(maxSinglesCount, singlescount);
      }
    });

  const teamSize = Object.keys(categories).length
    ? Math.max(singlesMatchUpTotal, doublesMatchUpTotal * 2)
    : Math.max(maxSinglesCount, maxDoublesCount * 2);
  const maxDoublesDraw = maxDoublesCount * (drawSize + alternatesCount);
  const maxSinglesDraw = maxSinglesCount * (drawSize + alternatesCount);

  return {
    maxDoublesDraw,
    maxSinglesDraw,
    teamSize,
    genders,
  };
}
