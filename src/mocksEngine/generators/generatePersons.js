import { parseAgeCategoryCode } from '../../global/functions/parseAgeCategoryCode';
import { definedAttributes } from '../../utilities/objects';
import { generatePersonData } from './generatePersonData';
import { dateFromDay } from '../../utilities/dateTime';
import { countries } from '../../fixtures/countryData';
import {
  generateRange,
  randomMember,
  shuffleArray,
  randomPop,
} from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { MALE, FEMALE } from '../../constants/genderConstants';

/**
 * @param {integer} count - number of persons to generate
 * @param {string} sex - optional - MALE or FEMALE
 * @param {object[]} personData - optional array of persons to seed generator [{ firstName, lastName, sex, nationalityCode }]
 * @param {object} personExtensions - optional array of extentsions to apply to all persons
 */
export function generatePersons({
  personExtensions,
  consideredDate,
  isMock = true,
  gendersCount,
  personData,
  count = 1,
  category,
  sex,
} = {}) {
  if (isNaN(count)) return { error: INVALID_VALUES };

  const maleCount = gendersCount ? gendersCount[MALE] : 0;
  const femaleCount = gendersCount ? gendersCount[FEMALE] : 0;
  count = Math.max(count, maleCount + femaleCount);
  const defaultCount = count - (maleCount + femaleCount);

  const defaultMalePersonData =
    (maleCount &&
      generatePersonData({
        count: maleCount,
      }).personData) ||
    [];

  const defaultFemalePersonData =
    (femaleCount &&
      generatePersonData({
        count: femaleCount,
      }).personData) ||
    [];

  const defaultPersonData = [
    ...defaultMalePersonData,
    ...defaultFemalePersonData,
    ...((defaultCount &&
      generatePersonData({
        count: defaultCount,
      }).personData) ||
      []),
  ];

  let validPersonData = defaultPersonData.filter(
    (person) => !sex || (maleCount && femaleCount) || person.sex === sex
  );

  let nationalityCodes = [];

  if (Array.isArray(personData)) {
    const validatedPersonData = personData.filter((person) => {
      if (typeof person.firstName !== 'string') return false;
      if (typeof person.lastName !== 'string') return false;
      if (![MALE, FEMALE].includes(person.sex)) return false;
      if (
        person.nationalityCode &&
        (typeof person.nationalityCode !== 'string' ||
          person.nationalityCode.length > 3 ||
          !countries.find(({ iso, ioc }) =>
            [iso, ioc].includes(person.nationalityCode)
          ))
      )
        return false;

      if (person.nationalityCode) nationalityCodes.push(person.nationalityCode);

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

  const { ageMinDate, ageMaxDate } = parseAgeCategoryCode({
    consideredDate,
    category,
  });

  const rangeStart =
    parseInt(ageMinDate?.slice(0, 4) || 0) ||
    parseInt(ageMaxDate?.slice(0, 4) || 0) - 3;

  const rangeEnd =
    parseInt(ageMaxDate?.slice(0, 4) || 0) ||
    parseInt(ageMinDate?.slice(0, 4) || 0) + 3;

  const yearRange = (ageMinDate || ageMaxDate) && [rangeStart, rangeEnd];

  const persons = shuffledPersons.slice(0, count).map((person, i) => {
    const birthYear = yearRange && randomPop(generateRange(...yearRange));
    const birthDay = randomPop(generateRange(0, 365));
    const birthDate = birthYear && dateFromDay(birthYear, birthDay);

    const updatedPerson = Object.assign(
      definedAttributes({
        extensions: personExtensions || [{ name: 'regionCode', value: i + 1 }],
        birthDate,
        isMock,
      }),
      person
    );

    return updatedPerson;
  });

  return {
    persons: (persons.length && persons) || shuffledPersons[0],
    nationalityCodes,
  };
}
