import { generateRange, randomMember, shuffleArray } from '../../utilities';
import defaultPersonData from '../data/persons.json';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { MALE, FEMALE } from '../../constants/genderConstants';

/**
 * @param {integer} count - number of persons to generate
 * @param {string} sex - optional - MALE or FEMALE
 * @param {object[]} personData - optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
 * @param {object} personExtensions - optional array of extentsions to apply to all persons
 */
export function personMocks({
  count = 1,
  sex,
  personData,
  personExtensions,
} = {}) {
  if (isNaN(count)) return { error: INVALID_VALUES };

  let validPersonData = defaultPersonData.filter(
    (person) => !sex || person.sex === sex
  );
  if (Array.isArray(personData)) {
    const validatedPersonData = personData.filter((person) => {
      if (typeof person.firstName !== 'string') return false;
      if (typeof person.lastName !== 'string') return false;
      if (![MALE, FEMALE].includes(person.sex)) return false;
      if (
        typeof person.nationalityCode !== 'string' ||
        person.nationalityCode.length > 3
      )
        return false;
      return true;
    });

    if (validatedPersonData.length) {
      validPersonData = validatedPersonData;
    } else {
      return { error: INVALID_VALUES };
    }
  }
  const shuffledPersons = shuffleArray(validPersonData);

  if (shuffledPersons.length < count) {
    const {
      maleFirstNames,
      maleLastNames,
      femaleFirstNames,
      femaleLastNames,
      nationalityCodes,
    } = defaultPersonData.reduce(
      (a, person) => {
        const { firstName, lastName, nationalityCode } = person;
        if (person.sex === MALE) {
          if (!a.maleFirstNames.includes(firstName))
            a.maleFirstNames.push(firstName);
          if (!a.maleLastNames.includes(lastName))
            a.maleLastNames.push(lastName);
        } else {
          if (!a.femaleFirstNames.includes(firstName))
            a.femaleFirstNames.push(firstName);
          if (!a.femaleLastNames.includes(lastName))
            a.femaleLastNames.push(lastName);
        }
        if (!a.nationalityCodes.includes(nationalityCode))
          a.nationalityCodes.push(nationalityCode);
        return a;
      },
      {
        maleFirstNames: [],
        maleLastNames: [],
        femaleFirstNames: [],
        femaleLastNames: [],
        nationalityCodes: [],
      }
    );
    generateRange(0, count - shuffledPersons.length).forEach(() => {
      const personSex = sex || randomMember([MALE, FEMALE]);
      const nationalityCode = randomMember(nationalityCodes);
      const firstName =
        personSex === MALE
          ? randomMember(maleFirstNames)
          : randomMember(femaleFirstNames);
      const lastName =
        personSex === MALE
          ? randomMember(maleLastNames)
          : randomMember(femaleLastNames);
      const person = {
        firstName,
        lastName,
        sex: personSex,
        nationalityCode,
      };
      shuffledPersons.push(person);
    });
  }

  const persons = shuffledPersons.slice(0, count).map((person, i) => {
    return Object.assign(person, {
      extensions: personExtensions || [{ name: 'regionCode', value: i + 1 }],
    });
  });
  return { persons: (persons.length && persons) || shuffledPersons[0] };
}
