import { generatePersonData } from '../generators/generatePersonData';
import { generatePersons } from '../generators/generatePersons';
import { tournamentEngine } from '../..';
import { UUID } from '../../utilities';
import { expect, test } from 'vitest';
import mocksEngine from '..';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';
import { ROUND_ROBIN } from '../../constants/drawDefinitionConstants';
import { MALE } from '../../constants/genderConstants';

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
  expect(result.error).toEqual(INVALID_VALUES);

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
        lastName: 'Fuller',
        sex: MALE,
        nationalityCode: 'USA',
      },
    ],
  });
  expect(result.persons.length).toEqual(1);

  result = generatePersons({
    personData: [
      {
        firstName: 'Buckminster',
        lastName: 'Fuller',
        sex: MALE,
        nationalityCode: 'USSR',
      },
    ],
  });
  // because nationalityCode has to be 3 letters
  expect(result.error).toEqual(INVALID_VALUES);

  result = generatePersons({
    personData: [
      {
        firstName: 'Buckminster',
        lastName: 'Fuller',
        sex: MALE,
        nationalityCode: 'XXX',
      },
    ],
  });
  // because XXX is not a valid ioc/iso code
  expect(result.error).toEqual(INVALID_VALUES);
});

const defaultPersonData = generatePersonData({ count: 8 }).personData;
const personData = defaultPersonData
  .slice(0, 8)
  .map((person) => Object.assign(person, { personId: UUID() }));

const firstNames = personData.map(({ firstName }) => firstName);
const lastNames = personData.map(({ lastName }) => lastName);

const scenarios = [
  undefined,
  { drawSize: 8 },
  { drawSize: 8, drawType: ROUND_ROBIN },
];

test.each(scenarios)(
  'can generate participants with identical persons for different draw types',
  (drawProfile) => {
    // create 8 persons to be used across multiple tournaments
    let { tournamentRecord } = mocksEngine.generateTournamentRecord({
      participantsProfile: { personData, participantsCount: 8 },
      drawProfiles: drawProfile && [drawProfile],
    });
    tournamentEngine.setState(tournamentRecord);

    let { tournamentParticipants } =
      tournamentEngine.getTournamentParticipants();

    tournamentParticipants.forEach((participant) => {
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

  const augmentedPersonData = personData.map((data) => ({
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

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();

  tournamentParticipants.forEach((participant) => {
    expect(participant.extensions).toEqual(participantExtensions);
    expect(participant.timeItems).toEqual(participantTimeItems);
  });
});
