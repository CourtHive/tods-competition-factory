import { generatePersons } from '../generatePersons';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { MALE } from '../../../constants/genderConstants';
import defaultPersonData from '../../data/persons.json';
import { UUID } from '../../../utilities';
import mocksEngine from '../..';
import { tournamentEngine } from '../../..';
import { ROUND_ROBIN } from '../../../constants/drawDefinitionConstants';

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

const scenarios = [
  undefined,
  { drawSize: 8 },
  { drawSize: 8, drawType: ROUND_ROBIN },
];

const personData = defaultPersonData
  .slice(0, 8)
  .map((person) => Object.assign(person, { personId: UUID() }));

const firstNames = personData.map(({ firstName }) => firstName);
const lastNames = personData.map(({ lastName }) => lastName);

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

/*
person.participantExtensions and person.participantTimeItems
capture the points totals from one tournament, generate rankings, pass participants into another tournament with seeded draws
*/
