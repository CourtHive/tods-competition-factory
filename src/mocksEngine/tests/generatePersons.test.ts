import { generatePersonData } from '../generators/generatePersonData';
import { generatePersons } from '../generators/generatePersons';
import { UUID, instanceCount } from '../../utilities';
import namesData from '../data/names.json';
import { tournamentEngine } from '../..';
import { expect, test } from 'vitest';
import mocksEngine from '..';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { ROUND_ROBIN } from '../../constants/drawDefinitionConstants';
import { MALE } from '../../constants/genderConstants';

test('lastName uniqueness', () => {
  const counts = Object.assign(
    {},
    ...Object.keys(namesData).map((key) => ({ [key]: namesData[key].length }))
  );
  const { persons } = generatePersons({ count: counts.lastNames, sex: MALE });
  const lastNameMap = instanceCount(persons.map((p) => p.lastName));
  const lastNameCounts: number[] = Object.values(lastNameMap);
  const lastNames = Math.max(...lastNameCounts);
  expect(lastNames).toEqual(1);
});

test('basic person generation', () => {
  let result = generatePersons();
  expect(result.persons.length).toEqual(1);

  result = generatePersons({ count: 'A' });
  expect(result.error).toEqual(INVALID_VALUES);

  result = generatePersons({
    personData: [{ firstName: 'Buckminster', lastName: 'Fuller', sex: MALE }],
  });
  expect(result.persons.length).toEqual(1);

  result = generatePersons({
    personData: [{ firstName: 'Buckminster', lastName: 'Fuller' }],
  });
  expect(result.error).toBeUndefined();

  result = generatePersons({
    personData: [{ lastName: 'Fuller', sex: MALE }],
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = generatePersons({
    personData: [{ firstName: 'Buckminster', sex: MALE }],
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = generatePersons({
    personData: [
      {
        firstName: 'Buckminster',
        nationalityCode: 'USA',
        lastName: 'Fuller',
        sex: MALE,
      },
    ],
  });
  expect(result.persons.length).toEqual(1);

  result = generatePersons({
    personData: [
      {
        firstName: 'Buckminster',
        nationalityCode: 'USSR',
        lastName: 'Fuller',
        sex: MALE,
      },
    ],
  });
  // because nationalityCode has to be 3 letters
  expect(result.error).toEqual(INVALID_VALUES);

  result = generatePersons({
    personData: [
      {
        firstName: 'Buckminster',
        nationalityCode: 'XXX',
        lastName: 'Fuller',
        sex: MALE,
      },
    ],
  });
  // because XXX is not a valid ioc/iso code
  expect(result.error).toEqual(INVALID_VALUES);
});

const defaultPersonData = generatePersonData({ count: 8 }).personData;
const personData = defaultPersonData
  ?.slice(0, 8)
  .map((person) => Object.assign(person, { personId: UUID() }));

const firstNames = (personData || []).map(({ firstName }) => firstName);
const lastNames = (personData || []).map(({ lastName }) => lastName);

const scenarios = [
  undefined,
  { drawSize: 8 },
  { drawSize: 8, drawType: ROUND_ROBIN },
];

test.each(scenarios)(
  'can generate participants with identical persons for different draw types',
  (drawProfile) => {
    // create 8 persons to be used across multiple tournaments
    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      participantsProfile: { personData, participantsCount: 8 },
      drawProfiles: drawProfile && [drawProfile],
    });
    tournamentEngine.setState(tournamentRecord);

    const { participants } = tournamentEngine.getParticipants();

    participants.forEach((participant) => {
      const included =
        firstNames.includes(participant.person.standardGivenName) &&
        lastNames.includes(participant.person.standardFamilyName);
      expect(included).toEqual(true);
    });
  }
);

test('it can attach participant extensions and timeItems from personData', () => {
  const participantExtensions = [{ name: 'test', value: 1 }];
  const participantTimeItems = [
    {
      itemType: 'SCALE.RATING.SINGLES.WTN',
      itemName: 'test',
      itemValue: '10.2',
    },
  ];

  const augmentedPersonData = (personData || []).map((data) => ({
    ...data,
    participantExtensions,
    participantTimeItems,
  }));

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    participantsProfile: {
      personData: augmentedPersonData,
      participantsCount: 8,
    },
  });
  tournamentEngine.setState(tournamentRecord);

  const { participants } = tournamentEngine.getParticipants();

  participants.forEach((participant) => {
    expect(participant.extensions).toEqual(participantExtensions);
    expect(participant.timeItems).toEqual(participantTimeItems);
  });
});
