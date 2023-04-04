import { countries } from '../../fixtures/countryData';
import namesData from '../data/names.json';
import {
  generateRange,
  makeDeepCopy,
  randomMember,
  randomPop,
} from '../../utilities';

import { FEMALE, MALE } from '../../constants/genderConstants';

export function generatePersonData({ count = 100, sex } = {}) {
  const personData = [];
  if (!count || (sex && ![MALE, FEMALE].includes(sex))) return { personData };

  const { lastNames, firstFemale, firstMale } = namesData;
  const ISOs = countries.map(({ iso }) => iso).filter(Boolean);

  const lastNameDupeCount = Math.ceil(count / lastNames.length);
  const femaleDupeCount = Math.ceil(count / firstFemale.length);
  const maleDupeCount = Math.ceil(count / firstMale.length);

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

  for (let i = 0; i < count; i++) {
    const lastName = lastNameDupes.pop();
    const personSex = sex || randomMember([MALE, FEMALE]);
    const firstName = personSex === MALE ? maleDupes.pop() : femaleDupes.pop();
    const nationalityCode = randomMember(ISOs);
    personData.push({ firstName, lastName, sex: personSex, nationalityCode });
  }

  return { personData };
}
