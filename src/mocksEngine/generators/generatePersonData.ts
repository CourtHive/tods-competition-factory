import { countries } from '../../fixtures/countryData';
import namesData from '../data/names.json';
import {
  generateRange,
  makeDeepCopy,
  randomMember,
  randomPop,
} from '../../utilities';

import { FEMALE, MALE } from '../../constants/genderConstants';
import {
  ErrorType,
  INVALID_VALUES,
} from '../../constants/errorConditionConstants';

export function generatePersonData(params?): {
  personData?: any[];
  error?: ErrorType;
} {
  const { count = 100, sex } = params || {};
  if (!count || (sex && ![MALE, FEMALE].includes(sex)))
    return { personData: [], error: INVALID_VALUES };

  // generate 30% more than count to account for duplicated firstName/lastName
  const buffer = Math.ceil(count * 1.3);

  const { lastNames, firstFemale, firstMale } = namesData;
  const ISOs = countries.map(({ iso }) => iso).filter(Boolean);

  const lastNameDupeCount = Math.ceil(buffer / lastNames.length);
  const femaleDupeCount = Math.ceil(buffer / firstFemale.length);
  const maleDupeCount = Math.ceil(buffer / firstMale.length);

  const lastNameDupes = generateRange(0, lastNameDupeCount).flatMap(() => {
    const n = makeDeepCopy(lastNames, false, true); // internal use
    return generateRange(0, lastNames.length).map(() => randomPop(n));
  });
  const femaleDupes = generateRange(0, femaleDupeCount).flatMap(() => {
    const n = makeDeepCopy(firstFemale, false, true); // internal use
    return generateRange(0, firstFemale.length).map(() => randomPop(n));
  });
  const maleDupes = generateRange(0, maleDupeCount).flatMap(() => {
    const n = makeDeepCopy(firstMale, false, true); // internal use
    return generateRange(0, firstMale.length).map(() => randomPop(n));
  });

  const candidates = {};
  for (let i = 0; i < buffer; i++) {
    const lastName = lastNameDupes.pop();
    const personSex = sex || randomMember([MALE, FEMALE]);
    const firstName = personSex === MALE ? maleDupes.pop() : femaleDupes.pop();
    const nationalityCode = randomMember(ISOs);
    candidates[`${firstName}${lastName}`] = {
      nationalityCode,
      sex: personSex,
      firstName,
      lastName,
    };
  }

  const personData = Object.values(candidates).slice(0, count);

  return { personData };
}
