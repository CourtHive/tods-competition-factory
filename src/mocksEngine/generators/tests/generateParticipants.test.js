import defaultPersonData from '../../data/persons.json';
import mocksEngine from '../..';
import { FEMALE, MALE } from '../../../constants/genderConstants';
import { INVALID_VALUES } from '../../../constants/errorConditionConstants';

it('can generate unique participants', () => {
  const participantsCount = defaultPersonData.length + 10;
  const { participants } = mocksEngine.generateParticipants({
    participantsCount,
  });
  expect(participants[participants.length - 1].person.firstName).not.toEqual(
    'GivenName'
  );
});

it('can accept custom personData', () => {
  const personData = [
    { firstName: 'Sam', lastName: 'Smith', sex: MALE, nationality: 'SUI' },
    {
      firstName: 'Jennifer',
      lastName: 'Jameson',
      sex: FEMALE,
      nationality: 'IRL',
    },
  ];
  const { participants, error } = mocksEngine.generateParticipants({
    participantsCount: 2,
    personData,
  });
  expect(participants).toBeUndefined();
  expect(error).toEqual(INVALID_VALUES);
});

it('can accept custom personData', () => {
  const personData = [
    { firstName: 'Sam', lastName: 'Smith', sex: MALE, nationalityCode: 'SUI' },
    {
      firstName: 'Jennifer',
      lastName: 'Jameson',
      sex: FEMALE,
      nationalityCode: 'IRL',
    },
  ];
  const { participants, error } = mocksEngine.generateParticipants({
    participantsCount: 4,
    personData,
  });
  expect(error).toBeUndefined();
  const samIndex = participants.findIndex(
    ({ person }) =>
      person.standardGivenName === 'Sam' &&
      person.standardFamilyName === 'Smith'
  );
  const jennyIndex = participants.findIndex(
    ({ person }) =>
      person.standardGivenName === 'Jennifer' &&
      person.standardFamilyName === 'Jameson'
  );
  expect([samIndex, jennyIndex].sort()).toEqual([0, 1]);
});
