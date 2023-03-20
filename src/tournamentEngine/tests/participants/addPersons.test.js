import defaultPersonData from '../../../mocksEngine/data/persons.json';
import tournamentEngine from '../../sync';
import { UUID } from '../../../utilities';
import { expect, test } from 'vitest';

import {
  INVALID_PARTICIPANT_ROLE,
  INVALID_VALUES,
  MISSING_PERSON_DETAILS,
} from '../../../constants/errorConditionConstants';

test('it can addPersons and create INDIVIDUAL and PAIR participants', () => {
  const personsCount = 20;
  tournamentEngine.newTournamentRecord();

  let result = tournamentEngine.addPersons();
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.addPersons({
    persons: defaultPersonData.slice(0, personsCount),
  });
  expect(result.error).toEqual(MISSING_PERSON_DETAILS);

  const persons = defaultPersonData.slice(0, personsCount).map((person) => ({
    nationalityCode: person.nationalityCode,
    standardFamilyName: person.lastName,
    standardGivenName: person.firstName,
    personId: UUID(),
    sex: person.sex,
  }));

  result = tournamentEngine.addPersons({
    participantRole: 'invalid role',
    persons,
  });
  expect(result.error).toEqual(INVALID_PARTICIPANT_ROLE);

  result = tournamentEngine.addPersons({ persons });
  expect(result.success).toEqual(true);
  expect(result.addedCount).toEqual(personsCount);

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(persons.length);

  persons[0].pairedPersons = [{ personId: persons[1].personId }];
  result = tournamentEngine.addPersons({ persons });
  expect(result.success).toEqual(true);
  expect(result.addedCount).toEqual(1);

  // won't add duplicate pair participants
  result = tournamentEngine.addPersons({ persons });
  expect(result.success).toEqual(true);
  expect(result.addedCount).toEqual(0);

  // won't add duplicate pair participants ... even when defined on second person
  persons[1].pairedPersons = [{ personId: persons[0].personId }];
  result = tournamentEngine.addPersons({ persons });
  expect(result.success).toEqual(true);
  expect(result.addedCount).toEqual(0);

  persons[2].pairedPersons = [{ personId: persons[3].personId }];
  result = tournamentEngine.addPersons({ persons });
  expect(result.success).toEqual(true);
  expect(result.addedCount).toEqual(1);
});
